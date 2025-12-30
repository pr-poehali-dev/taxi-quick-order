import json
import os
import psycopg2
import hashlib

def handler(event: dict, context) -> dict:
    '''API для административных операций такси-платформы'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        query_params = event.get('queryStringParameters') or {}
        action = query_params.get('action', '')
        
        if action == 'login' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            
            if not username or not password:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                "SELECT id, username, full_name FROM admins WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            admin = cur.fetchone()
            
            if not admin:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
            
            admin_id, username, full_name = admin
            
            cur.execute("SELECT balance FROM admin_balance ORDER BY id LIMIT 1")
            balance_row = cur.fetchone()
            admin_balance = float(balance_row[0]) if balance_row else 0.00
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'admin': {
                        'id': admin_id,
                        'username': username,
                        'full_name': full_name,
                        'balance': admin_balance
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'stats' and method == 'GET':
            cur.execute("SELECT COUNT(*) FROM users")
            total_users = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'driver'")
            total_drivers = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM driver_balances WHERE shift_active = true")
            active_shifts = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE")
            today_orders = cur.fetchone()[0]
            
            cur.execute("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'shift_payment' AND status = 'approved' AND DATE(created_at) = CURRENT_DATE")
            today_income = float(cur.fetchone()[0])
            
            cur.execute("SELECT balance FROM admin_balance ORDER BY id LIMIT 1")
            balance_row = cur.fetchone()
            admin_balance = float(balance_row[0]) if balance_row else 0.00
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'total_users': total_users,
                    'total_drivers': total_drivers,
                    'active_shifts': active_shifts,
                    'today_orders': today_orders,
                    'today_income': today_income,
                    'admin_balance': admin_balance
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'users' and method == 'GET':
            cur.execute(
                """SELECT u.id, u.phone, u.role, u.created_at,
                   CASE 
                       WHEN u.role = 'passenger' THEN 
                           (SELECT CONCAT(pb.rub_balance, '₽ / ', pb.bonus_balance, 'Б') 
                            FROM passenger_balances pb WHERE pb.user_id = u.id)
                       WHEN u.role = 'driver' THEN 
                           (SELECT CONCAT(db.balance, '₽') 
                            FROM driver_balances db WHERE db.user_id = u.id)
                   END as balance
                   FROM users u ORDER BY u.created_at DESC LIMIT 100"""
            )
            users = cur.fetchall()
            
            users_list = []
            for user in users:
                users_list.append({
                    'id': user[0],
                    'phone': user[1],
                    'role': user[2],
                    'balance': user[4] or '0₽',
                    'status': 'active',
                    'created_at': user[3].isoformat() if user[3] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users_list}),
                'isBase64Encoded': False
            }
        
        elif action == 'transactions' and method == 'GET':
            cur.execute(
                """SELECT t.id, u.phone, t.type, t.amount, t.status, t.created_at
                   FROM transactions t
                   JOIN users u ON t.user_id = u.id
                   WHERE t.status = 'pending'
                   ORDER BY t.created_at DESC LIMIT 50"""
            )
            transactions = cur.fetchall()
            
            tx_list = []
            for tx in transactions:
                tx_list.append({
                    'id': tx[0],
                    'user': tx[1],
                    'type': tx[2],
                    'amount': float(tx[3]),
                    'status': tx[4],
                    'date': tx[5].isoformat() if tx[5] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'transactions': tx_list}),
                'isBase64Encoded': False
            }
        
        elif action == 'process_transaction' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            transaction_id = body.get('transaction_id')
            tx_action = body.get('action')
            
            if not transaction_id or not tx_action:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'transaction_id и action обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT user_id, type, amount FROM transactions WHERE id = %s",
                (transaction_id,)
            )
            tx = cur.fetchone()
            
            if not tx:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Транзакция не найдена'}),
                    'isBase64Encoded': False
                }
            
            user_id, tx_type, amount = tx
            
            if tx_action == 'approve':
                if tx_type == 'deposit_rub':
                    cur.execute(
                        "UPDATE passenger_balances SET rub_balance = rub_balance + %s WHERE user_id = %s",
                        (amount, user_id)
                    )
                elif tx_type == 'deposit_bonus':
                    cur.execute(
                        "UPDATE passenger_balances SET bonus_balance = bonus_balance + %s WHERE user_id = %s",
                        (amount, user_id)
                    )
                elif tx_type == 'withdrawal':
                    cur.execute(
                        "UPDATE driver_balances SET balance = balance - %s WHERE user_id = %s",
                        (amount, user_id)
                    )
                
                cur.execute(
                    "UPDATE transactions SET status = 'approved', processed_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (transaction_id,)
                )
            else:
                cur.execute(
                    "UPDATE transactions SET status = 'rejected', processed_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (transaction_id,)
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Транзакция обработана'}),
                'isBase64Encoded': False
            }
        
        elif action == 'settings' and method == 'GET':
            cur.execute("SELECT setting_key, setting_value FROM system_settings")
            settings = cur.fetchall()
            
            settings_dict = {row[0]: row[1] for row in settings}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(settings_dict),
                'isBase64Encoded': False
            }
        
        elif action == 'update_settings' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            for key, value in body.items():
                cur.execute(
                    """INSERT INTO system_settings (setting_key, setting_value, updated_at) 
                       VALUES (%s, %s, CURRENT_TIMESTAMP)
                       ON CONFLICT (setting_key) DO UPDATE 
                       SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP""",
                    (key, str(value))
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Настройки обновлены'}),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
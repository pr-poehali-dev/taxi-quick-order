import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления балансами пользователей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            role = query_params.get('role', 'passenger')
            
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            if role == 'passenger':
                cur.execute(
                    "SELECT bonus_balance, rub_balance FROM passenger_balances WHERE user_id = %s",
                    (user_id,)
                )
                balance = cur.fetchone()
                
                if balance:
                    result = {
                        'bonus': float(balance[0]),
                        'rub': float(balance[1])
                    }
                else:
                    result = {'bonus': 0.00, 'rub': 0.00}
            else:
                cur.execute(
                    "SELECT balance, shift_active, shift_ends_at FROM driver_balances WHERE user_id = %s",
                    (user_id,)
                )
                balance = cur.fetchone()
                
                if balance:
                    result = {
                        'balance': float(balance[0]),
                        'shift_active': balance[1],
                        'shift_ends_at': balance[2].isoformat() if balance[2] else None
                    }
                else:
                    result = {'balance': 0.00, 'shift_active': False, 'shift_ends_at': None}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('user_id')
            amount = body.get('amount', 0)
            balance_type = body.get('balance_type', 'rub')
            
            if not user_id or amount <= 0:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id и amount обязательны'}),
                    'isBase64Encoded': False
                }
            
            if action == 'deposit':
                cur.execute(
                    """INSERT INTO transactions (user_id, type, amount, status) 
                       VALUES (%s, %s, %s, %s) RETURNING id""",
                    (user_id, f'deposit_{balance_type}', amount, 'pending')
                )
                transaction_id = cur.fetchone()[0]
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Заявка на пополнение создана',
                        'transaction_id': transaction_id
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'withdraw':
                cur.execute(
                    "SELECT balance FROM driver_balances WHERE user_id = %s",
                    (user_id,)
                )
                balance = cur.fetchone()
                
                if not balance or float(balance[0]) < amount:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно средств'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """INSERT INTO transactions (user_id, type, amount, status) 
                       VALUES (%s, %s, %s, %s) RETURNING id""",
                    (user_id, 'withdrawal', amount, 'pending')
                )
                transaction_id = cur.fetchone()[0]
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Заявка на вывод создана',
                        'transaction_id': transaction_id
                    }),
                    'isBase64Encoded': False
                }
            
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

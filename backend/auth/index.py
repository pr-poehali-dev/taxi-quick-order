import json
import os
import psycopg2
import hashlib

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей такси-платформы'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        phone = body.get('phone', '').strip()
        password = body.get('password', '').strip()
        role = body.get('role', 'passenger')
        full_name = body.get('full_name', '')
        
        if not phone or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Телефон и пароль обязательны'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if action == 'register':
            cur.execute(
                "SELECT id FROM users WHERE phone = %s",
                (phone,)
            )
            existing = cur.fetchone()
            
            if existing:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким номером уже существует'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO users (phone, password_hash, role, full_name) VALUES (%s, %s, %s, %s) RETURNING id",
                (phone, password_hash, role, full_name)
            )
            user_id = cur.fetchone()[0]
            
            if role == 'passenger':
                cur.execute(
                    "INSERT INTO passenger_balances (user_id, bonus_balance, rub_balance) VALUES (%s, %s, %s)",
                    (user_id, 0.00, 0.00)
                )
            elif role == 'driver':
                cur.execute(
                    "INSERT INTO driver_balances (user_id, balance, shift_active) VALUES (%s, %s, %s)",
                    (user_id, 0.00, False)
                )
                cur.execute(
                    "INSERT INTO driver_profiles (user_id) VALUES (%s)",
                    (user_id,)
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Регистрация успешна',
                    'user': {
                        'id': user_id,
                        'phone': phone,
                        'role': role,
                        'full_name': full_name
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            cur.execute(
                "SELECT id, phone, role, full_name FROM users WHERE phone = %s AND password_hash = %s",
                (phone, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный телефон или пароль'}),
                    'isBase64Encoded': False
                }
            
            user_id, phone, role, full_name = user
            
            balance_data = {}
            if role == 'passenger':
                cur.execute(
                    "SELECT bonus_balance, rub_balance FROM passenger_balances WHERE user_id = %s",
                    (user_id,)
                )
                balance = cur.fetchone()
                if balance:
                    balance_data = {
                        'bonus': float(balance[0]),
                        'rub': float(balance[1])
                    }
            elif role == 'driver':
                cur.execute(
                    "SELECT balance, shift_active, shift_ends_at FROM driver_balances WHERE user_id = %s",
                    (user_id,)
                )
                balance = cur.fetchone()
                if balance:
                    balance_data = {
                        'balance': float(balance[0]),
                        'shift_active': balance[1],
                        'shift_ends_at': balance[2].isoformat() if balance[2] else None
                    }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Вход выполнен',
                    'user': {
                        'id': user_id,
                        'phone': phone,
                        'role': role,
                        'full_name': full_name,
                        'balance': balance_data
                    }
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
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }

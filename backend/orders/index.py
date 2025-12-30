import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для создания и управления заказами такси'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            passenger_id = body.get('passenger_id')
            from_address = body.get('from_address', '').strip()
            to_address = body.get('to_address', '').strip()
            amount = body.get('amount', 0)
            payment_method = body.get('payment_method', 'cash')
            comment = body.get('comment', '')
            
            if not from_address or not to_address or amount <= 0:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Укажите адреса и стоимость'}),
                    'isBase64Encoded': False
                }
            
            discount = 0
            final_price = amount
            
            if payment_method in ['bonus', 'rub']:
                discount = round(amount * 0.3, 2)
                final_price = amount - discount
                
                cur.execute(
                    "SELECT bonus_balance, rub_balance FROM passenger_balances WHERE user_id = %s",
                    (passenger_id,)
                )
                balance = cur.fetchone()
                
                if not balance:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Баланс не найден'}),
                        'isBase64Encoded': False
                    }
                
                bonus_balance, rub_balance = float(balance[0]), float(balance[1])
                
                if payment_method == 'bonus' and bonus_balance < final_price:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно бонусов'}),
                        'isBase64Encoded': False
                    }
                
                if payment_method == 'rub' and rub_balance < final_price:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Недостаточно рублей'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute(
                """INSERT INTO orders (passenger_id, from_address, to_address, amount, payment_method, 
                   final_price, discount, comment) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (passenger_id, from_address, to_address, amount, payment_method, final_price, discount, comment)
            )
            order_id = cur.fetchone()[0]
            
            if payment_method in ['bonus', 'rub']:
                if payment_method == 'bonus':
                    cur.execute(
                        "UPDATE passenger_balances SET bonus_balance = bonus_balance - %s WHERE user_id = %s",
                        (final_price, passenger_id)
                    )
                else:
                    cur.execute(
                        "UPDATE passenger_balances SET rub_balance = rub_balance - %s WHERE user_id = %s",
                        (final_price, passenger_id)
                    )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'order_id': order_id,
                    'final_price': final_price,
                    'discount': discount
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
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
                    """SELECT id, from_address, to_address, amount, final_price, discount, 
                       payment_method, status, created_at 
                       FROM orders WHERE passenger_id = %s ORDER BY created_at DESC LIMIT 50""",
                    (user_id,)
                )
            else:
                cur.execute(
                    """SELECT id, from_address, to_address, amount, final_price, discount, 
                       payment_method, status, created_at 
                       FROM orders WHERE driver_id = %s ORDER BY created_at DESC LIMIT 50""",
                    (user_id,)
                )
            
            orders = cur.fetchall()
            orders_list = []
            
            for order in orders:
                orders_list.append({
                    'id': order[0],
                    'from_address': order[1],
                    'to_address': order[2],
                    'amount': float(order[3]),
                    'final_price': float(order[4]),
                    'discount': float(order[5]),
                    'payment_method': order[6],
                    'status': order[7],
                    'created_at': order[8].isoformat() if order[8] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'orders': orders_list}),
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

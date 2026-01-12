from flask import Flask, jsonify, request, Response, make_response
import sqlite3
import time
import json
from datetime import datetime

app = Flask(__name__)

# Конфигурация (можно вынести в отдельный файл)
HAPP_NAME = "MAGAMIX VPN"
HAPP_LOGO = "https://cdn-icons-png.flaticon.com/512/3067/3067256.png"
SERVER_LOCATION = "Reality NL-trial"
DB_FILE = "users.db"  # укажите путь к вашей базе данных

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return f"{HAPP_NAME} Subscription Service - Reality NL-trial"

@app.route('/sub/<sub_id>')
def get_subscription(sub_id):
    """
    Endpoint для подписок Happ
    Возвращает конфигурацию с названием и логотипом
    """
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Получаем данные о подписке
        cursor.execute("""
            SELECT k.uuid, k.end_date, k.days, k.created_at 
            FROM keys k 
            WHERE k.sub_id = ?
        """, (sub_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"error": "Subscription not found"}), 404
        
        # Парсим дату окончания
        if isinstance(row['end_date'], str):
            try:
                end_date = datetime.fromisoformat(row['end_date'])
            except:
                end_date = datetime.strptime(row['end_date'], '%Y-%m-%d %H:%M:%S')
        else:
            end_date = row['end_date']
        
        expiry_timestamp = int(end_date.timestamp())
        current_time = int(time.time())
        time_left = max((expiry_timestamp - current_time) * 1000, 0)
        
        # Генерируем базовую конфигурацию
        config = {
            "name": HAPP_NAME,
            "logo": HAPP_LOGO,
            "version": "1.0",
            "subscription": {
                "id": sub_id,
                "name": HAPP_NAME,
                "expire": expiry_timestamp * 1000,
                "time_left": time_left,
                "created": current_time * 1000,
                "updated": current_time * 1000,
                "info": f"{SERVER_LOCATION} | {row['days']} дней"
            },
            "metadata": {
                "provider": HAPP_NAME,
                "support": "https://t.me/nejnayatp3",
                "website": "https://t.me/your_bot_username",
                "version": "1.0"
            }
        }
        
        # Создаем ответ с правильными заголовками
        response = make_response(json.dumps(config, indent=2, ensure_ascii=False))
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['X-Subscription-Name'] = HAPP_NAME
        response.headers['X-Subscription-Logo'] = HAPP_LOGO
        response.headers['Access-Control-Allow-Origin'] = '*'
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/url/')
def deeplink_handler():
    """
    Обработчик deeplink для Happ
    """
    url = request.args.get('url', '')
    if url:
        # Возвращаем HTML страницу с редиректом
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="refresh" content="0; url={url}">
            <title>{HAPP_NAME}</title>
        </head>
        <body>
            <p>Открытие {HAPP_NAME} в Happ...</p>
            <script>
                window.location.href = "{url}";
            </script>
        </body>
        </html>
        '''
    return "Missing URL parameter", 400

@app.route('/connect/<sub_id>')
def connect_subscription(sub_id):
    """
    Альтернативный endpoint для подписки
    """
    return jsonify({
        "action": "add_subscription",
        "url": f"{request.host_url}sub/{sub_id}",
        "name": HAPP_NAME,
        "logo": HAPP_LOGO
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)

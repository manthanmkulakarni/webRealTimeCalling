from flask import Flask, redirect, url_for, render_template
app = Flask(__name__)

@app.route('/session/<session_id>/')
def session(session_id):
   return render_template("index.html")

@app.route('/')
def session_connection():
   sess_id=3
   return redirect(url_for('session',session_id = sess_id))

if __name__ == '__main__':
   app.run()
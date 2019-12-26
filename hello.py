from flask import Flask, redirect, url_for, render_template
app = Flask(__name__)

addr=str(raw_input('Enter the url'))

@app.route('/'+addr+'/')
def openadd():
    return redirect("http://"+addr)

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=8085)
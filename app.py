from flask import Flask
app = Flask(__name__) # create instance of Flask

# Main page route
@app.route('/')
def hello():
	return "Hello!"

if __name__ == '__main__':
	app.run()
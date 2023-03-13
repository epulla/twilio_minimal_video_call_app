# Run commands
start:
	flask --app app/app run --debug

start_ngrok:
	ngrok http 5000

# Installation
## Linux/MacOS
install:
	python3 -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt

## Windows
install_win:
	python -m venv .venv
	.venv\Scripts\activate
	pip install -r requirements.txt

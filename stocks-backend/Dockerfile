FROM python:3.8.8-slim-buster

WORKDIR /backend

COPY ./requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt --no-cache-dir

EXPOSE 8000
COPY . /backend
CMD ["python3", "main.py"]
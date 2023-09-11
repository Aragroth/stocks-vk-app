import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request

from enum import Enum
from typing import List

from models import Point, Ranges, companies_to_watch, Company

from stocks_api import StocksAPI
from proxy import StocksProxy

debug = False
app = FastAPI()

if not debug:
    app = FastAPI(redoc_url=None, docs_url=None)

stocks_url = 'https://docs.google.com/spreadsheets/d/1HflVng6sYIb6Gs4pOKiDGtqU5YJ2-hgdM4pRNaT62gs/export?format=csv&id=1HflVng6sYIb6Gs4pOKiDGtqU5YJ2-hgdM4pRNaT62gs'
api = StocksAPI(stocks_url, 'stocks_data.csv', 24 * 60 * 60)
api_proxy = StocksProxy(api, 120, companies_to_watch)

origins = [
    "http://localhost:10888",
    "https://localhost:10888",
    "http://localhost:8000",
    "http://0.0.0.0:6000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/chart/{company}/{data_range}', response_model=List[Point])
async def chart_data(data_range: Ranges, company: str) -> List[Point]:
    return api_proxy.get_chart_data(company, data_range)


@app.get('/company/info/{company}', response_model=Company)
async def company_data(company: str):
    return api_proxy.get_company_info(company)


@app.get('/all', response_model=List[Company])
async def companies_top() -> List[Company]:
    return api_proxy.get_all_companies()


@app.get('/company/about/{company}')
async def about(company):
    return api_proxy.get_about_company(company)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

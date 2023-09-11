from stocks_api import StocksAPI
from models import companies_to_watch

from proxy import StocksProxy

stocks_url = 'https://docs.google.com/spreadsheets/d/1HflVng6sYIb6Gs4pOKiDGtqU5YJ2-hgdM4pRNaT62gs/export?format=csv&id=1HflVng6sYIb6Gs4pOKiDGtqU5YJ2-hgdM4pRNaT62gs'

api = StocksAPI(stocks_url, 'stocks_data.csv', companies_to_watch)

proxy = StocksProxy(api, 60, companies_to_watch)

print(proxy.get_company_info("TSLA"))
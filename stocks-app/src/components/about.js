import React, { useState, useEffect } from 'react';
import Chart from './stocksChart'

import { PopoutWrapper, ScreenSpinner } from '@vkontakte/vkui';

import { Button, Div, Group, Header, Cell, List } from '@vkontakte/vkui';

let popup = (<PopoutWrapper alignY="center" alignX="center">
    <ScreenSpinner />
</PopoutWrapper>)

async function getCompanyInfo(companyName, setActiveList, setPopup) {
    setPopup(popup)

    let data = {}
    let full_company_name = ''
    await fetch(`/api/company/info/${companyName}`)
        .then((response) => {
            return response.json()
        })
        .then((data_json) => {
            let change = String(data_json.change)[0] === '-' ? data_json.change.toFixed(2) + '%' : '+' + data_json.change.toFixed(2) + '%'
            full_company_name = data_json.name

            data = {
                type: String(data_json.change).includes("-") ? "red" : "green",
                meta: [
                    ["Текущая цена", data_json.current_price.toFixed(2) + '$'],
                    ["Прирост", change],
                    ["Капитализация", data_json.capitalization.toFixed(2) + "B$"],
                ]
            }

            setActiveList(data)
        })
        .catch((err) => {
            console.log(err)
        })

    await fetch(`/api/company/about/${full_company_name}`)
        .then((response) => {
            return response.json()
        })
        .then((data_json) => {
            data.info = data_json['about']
        })
        .catch((err) => {
            console.log(err)
        })


    setActiveList(data)
    setPopup(null)
}


export default ({ setPopup, chartRange, toggler, companyShortName }) => {

    const [draggingList, setActiveList] = useState({
        type: null,
        meta: [],
        info: '\n'
    });


    useEffect(() => {
        // когда необходимо обновить, нужно поставить type равным null

        if (draggingList.type === null) {
            getCompanyInfo(companyShortName, setActiveList, setPopup);
        }
    }, [])

    return (<React.Fragment>
        <Div style={{ padding: '20px 25px 20px', paddingTop: 20, color: 'gray' }}>
            <Chart chartRange={chartRange} companyName={companyShortName} />
        </Div>

        <Div style={{ padding: '0px 25px' }} >
            <Button size="xl" onClick={() => toggler()}>Выбрать период</Button>
        </Div>

        <Group style={{ padding: '0px 10px' }}></Group>
        <Group style={{ padding: '10px 10px' }} header={<Header mode="secondary">Информация о стоимости</Header>}>
            <List style={{ paddingTop: 10, paddingBottom: 10 }}>
                {draggingList.meta.map((item, index) => {
                    return (
                        <Cell key={index}
                        >{item[0]} <p style={{ margin: 0, marginRight: 10, float: 'right', color: draggingList.type }}> <strong>{item[1]}</strong> </p> </Cell>
                    )
                }
                )}
            </List>
        </Group>

        <Group style={{ padding: '0px 10px' }} header={<Header mode="secondary">О компании</Header>}>
            <Div style={{ padding: '0px 10px', paddingTop: 10, paddingBottom: 70, color: 'grey' }} >

                {draggingList.info ?
                    draggingList.info.split("\n").map(function (item, idx) {
                        return (
                            <span key={idx}>
                                {item}
                                <br />
                            </span>
                        )
                    }) : null
                }
            </Div>
        </Group>
    </React.Fragment>
    )
}
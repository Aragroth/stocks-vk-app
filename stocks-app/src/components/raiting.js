import React, { useState, useEffect } from 'react'

import { PopoutWrapper, ScreenSpinner, Avatar, Cell, List } from '@vkontakte/vkui';


function dynamicSort(property, sortOrder) {
  if (property[0] === "-") {
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers, 
     * and you may want to customize it to your needs
     */
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

let popup = (<PopoutWrapper alignY="center" alignX="center">
  <ScreenSpinner />
</PopoutWrapper>)

function getRating(setPopup, setRatingList) {
  setPopup(popup)

  fetch(`/api/all`)
    .then((response) => {
      return response.json()
    })
    .then((data_json) => {
      setRatingList({ fetched: true, meta: data_json })
      setPopup(null)
    })
    .catch((err) => {
      console.log(err)
    })
}

export default ({ sorting, setPopup, setCurrentPanel}) => {

  const [ratingList, setRatingList] = useState({
    fetched: false,
    meta: []
  });

  useEffect(() => {
    // когда необходимо обновить, нужно поставить type равным null
    if (!ratingList.fetched) {
      getRating(setPopup, setRatingList);
    }
  }, [sorting])

  let sorting_by = 'capitalization'
  switch (sorting) {
    case 'cost':
      sorting_by = 'current_price'
      break
    case 'change':
      sorting_by = 'change'
  }
  ratingList.meta.sort(dynamicSort(sorting_by, -1));


  return (

    <List style={{ padding: "10px 10px 70px 10px", color: 'red' }}>
      {
        ratingList.meta.map((value, index) => {
          let change = String(value['change'])[0] === '-' ? value['change'].toFixed(2) + '%' : '+' + value['change'].toFixed(2) + '%'
      
          if (sorting_by == 'change') {
            
            return (
              <Cell onClick={() => setCurrentPanel({view: 'company',  meta: {'name': value.name, 'short_name': value.short_name }})} before={<Avatar src={require(`../img/${value.name}.jpg`)}/>} key={index} >
                {value.name}
                <p style={{ margin: 0, marginRight: 10, float: 'right', color: change[0] === '-' ? 'red' : "green" }}>
                  <strong>{change}</strong>
                </p>
              </Cell>
            )
          } else if (sorting_by == 'capitalization') {

              return (
                <Cell onClick={() => setCurrentPanel({view: 'company',  meta: {'name': value.name, 'short_name': value.short_name }})} before={<Avatar src={require(`../img/${value.name}.jpg`)}/>} key={index} >
                  {value.name}
                  <p style={{ margin: 0, marginRight: 10, float: 'right', color: change[0] === '-' ? 'red' : "green" }}>
                  <strong> {value[sorting_by].toFixed(2) + 'B$'}</strong>
                  </p>
                </Cell>
              )
          }
          return (
          <Cell  onClick={() => setCurrentPanel({view: 'company',  meta: {'name': value.name, 'short_name': value.short_name }})} before={<Avatar src={require(`../img/${value.name}.jpg`)}/>} key={index} >
            {value.name}
            <p style={{ margin: 0, marginRight: 10, float: 'right', color: change[0] === '-' ? 'red' : "green"  }}>
            <strong>  {value[sorting_by].toFixed(2) + '$'}</strong>
            </p>
          </Cell>
          )
        })
      }

    </List>

  )
}
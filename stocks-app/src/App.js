import React, { useState, useEffect } from 'react';
import '@vkontakte/vkui/dist/vkui.css';

import {
  ActionSheet, ActionSheetItem, Panel, FixedLayout, PanelHeaderBack,
  Separator, Tabs, TabsItem, View, PanelHeader, PanelHeaderContent, Root
} from '@vkontakte/vkui';


import Sorting from './components/sorting'
import About from './components/about'
import Rating from './components/raiting'

// import bridge from '@vkontakte/vk-bridge';

const App = () => {
  const [activeTab, setActiveTab] = useState('tesla');
  const [popup, setPopup] = useState(null);

  const [chartRange, setChartRange] = useState("day");
  const [sorting, setSorting] = useState("capitalization");

  const [currentPanel, setCurrentPanel] = useState({ view: "main", meta: { name: "", short_name: "" } });
  console.log(popup)
  useEffect(() => {
    setChartRange("day")
  }, [currentPanel])

  function openBase() {
    setPopup(
      <ActionSheet onClose={() => setPopup(null)}>
        <ActionSheetItem autoclose onClick={() => setChartRange("day")}>
          День
        </ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => setChartRange("month")}>
          Месяц
        </ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => setChartRange("year")}>
          Год
        </ActionSheetItem>
        <ActionSheetItem autoclose mode="cancel">Отменить</ActionSheetItem>
      </ActionSheet>
    )
  }


  return (
    // 
    <Root activeView={currentPanel.view} >
      <View popout={popup} id="main" activePanel={'main'}>
        <Panel id="main">
          {activeTab !== 'tesla' ?
            <Sorting setSorting={setSorting}
            />

            : <PanelHeader>
              <PanelHeaderContent>
                Tesla
              </PanelHeaderContent>
            </PanelHeader>
          }

          {activeTab === 'tesla' ?
            <About
              companyName={"Tesla"}
              companyShortName={'TSLA'}
              chartRange={chartRange}
              toggler={openBase}
              setPopup={setPopup}
            /> :

            <Rating setPopup={setPopup} setCurrentPanel={setCurrentPanel} sorting={sorting} />
          }

          <FixedLayout vertical="bottom">
            <Separator wide />
            <Tabs>
              <TabsItem
                selected={activeTab === 'tesla'}
                onClick={() => setActiveTab('tesla')}
              >Tesla</TabsItem>
              <TabsItem
                selected={activeTab === 'raiting'}
                onClick={() => setActiveTab('raiting')}
              >Рейтинг</TabsItem>
            </Tabs>
          </FixedLayout>
        </Panel>


      </View>
      <View popout={popup} id="company">
        <Panel>
          <PanelHeader left={<PanelHeaderBack onClick={() => setCurrentPanel({ view: "main", meta: { name: "", short_name: "" } })} />}>
            {currentPanel.meta.name}
          </PanelHeader>

          <About
            companyName={currentPanel.meta.name}
            companyShortName={currentPanel.meta.short_name}
            chartRange={chartRange}
            toggler={openBase}
            setPopup={setPopup}
          />
        </Panel>
      </View>
    </Root>
  );
}

export default App;
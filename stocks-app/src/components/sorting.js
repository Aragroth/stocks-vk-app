import React, { useState } from 'react';

import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon24Done from '@vkontakte/icons/dist/24/done';

import { PanelHeaderContext,  PanelHeaderContent, Cell, List, PanelHeader, } from '@vkontakte/vkui';



export default ({setSorting}) => {

  const [contextMenu, setcontextMenu] = useState({ contextOpened: false, mode: 'capitalization' });

  function select(e) {
    const mode = e.currentTarget.dataset.mode;
    setcontextMenu({ contextOpened: !contextMenu.contextOpened, mode: mode })
    setSorting(mode)
  }
  

  return (
    <React.Fragment>
      <PanelHeader>
        <PanelHeaderContent
          aside={<Icon16Dropdown style={{ transform: `rotate(${contextMenu.contextOpened ? '180deg' : '0'})` }} />}
          onClick={() => setcontextMenu({ contextOpened: !contextMenu.contextOpened, mode: contextMenu.mode })}
        >
          Сортировать
            </PanelHeaderContent>
      </PanelHeader>
      <PanelHeaderContext opened={contextMenu.contextOpened} onClose={() => setcontextMenu({ ...contextMenu, toggleContext: !contextMenu.contextOpened })}>
        <List>
          <Cell
            asideContent={contextMenu.mode === 'capitalization' ? <Icon24Done fill="var(--accent)" /> : null}
            onClick={select}
            data-mode="capitalization"
          >
            Капитализации
              </Cell>
          <Cell
            asideContent={contextMenu.mode === 'change' ? <Icon24Done fill="var(--accent)" /> : null}
            onClick={select}
            data-mode="change"
          >
            Приросту стоимости
              </Cell>
          <Cell
            asideContent={contextMenu.mode === 'cost' ? <Icon24Done fill="var(--accent)" /> : null}
            onClick={select}
            data-mode="cost"
          >
            Стоимости акций
              </Cell>
        </List>
      </PanelHeaderContext> </React.Fragment>)
}
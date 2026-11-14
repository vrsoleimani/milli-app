import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { StatusBar, TabBar } from './ui.jsx';
import { Provider } from './store.jsx';
import { Home, Assets, Services, Card, Profile } from './tabs.jsx';
import {
  Buy, Send, Request, Pay, Success, Bills, Convert, NewJar, CreditUp, Welcome, OnbPhone, OnbGift,
} from './flows.jsx';
import * as S from './screens.jsx';
import { Split, Assistant, SalarySplit, RoundUp } from './extra.jsx';
import { PayHub } from './pay.jsx';
import { Pnl } from './pnl.jsx';

const TABS = { home: Home, assets: Assets, services: Services, card: Card };

const SCREENS = {
  welcome: () => <Welcome />,
  onbPhone: () => <OnbPhone />,
  onbGift: () => <OnbGift />,
  profile: () => <Profile />,
  payhub: (p) => <PayHub mode={p.mode} />,
  split: (p) => <Split title={p.title} total={p.total} />,
  assistant: () => <Assistant />,
  salary: () => <SalarySplit />,
  roundup: () => <RoundUp />,
  buy: (p) => <Buy preset={p.preset} />,
  sell: () => <S.Sell />,
  send: (p) => <Send to={p.to} preset={p.preset} gift={p.gift} />,
  request: () => <Request />,
  scan: () => <PayHub />,
  pay: () => <Pay />,
  success: (p) => <Success {...p} />,
  bills: () => <Bills />,
  convert: (p) => <Convert from={p.from} to={p.to} />,
  jar: () => <NewJar />,
  creditUp: () => <CreditUp />,
  wallet: () => <S.WalletPage />,
  rewards: () => <S.Rewards />,
  history: () => <S.History />,
  price: () => <S.Price />,
  accounts: () => <S.Accounts />,
  newAccount: () => <S.NewAccount />,
  notifications: () => <S.Notifications />,
  buyAsset: (p) => <S.BuyAsset p={p} />,
  asset: (p) => <S.AssetPage p={p} />,
  advisor: () => <S.Advisor />,
  credit: (p) => <S.CreditBuy p={p} />,
  loan: () => <S.Loan />,
  installments: () => <S.Installments />,
  payInstallment: (p) => <S.PayInstallment p={p} />,
  score: () => <S.Score />,
  insurance: () => <S.Insurance />,
  gallery: () => <S.Gallery />,
  goldyield: () => <S.GoldYield />,
  realestate: () => <S.RealEstate />,
  delivery: () => <S.Delivery />,
  giftcard: () => <S.GiftCard />,
  family: () => <S.Family />,
  myqr: () => <S.MyQR />,
  business: () => <S.Business />,
  cardAction: (p) => <S.CardAction p={p} />,
  backing: () => <S.Backing />,
  settings: (p) => <S.Settings p={p} />,
  confirm: (p) => <S.Confirm p={p} />,
  merchants: () => <S.Merchants />,
  pnl: (p) => <Pnl p={p} />,
};
const BARE = new Set(['scan', 'payhub']);

function App() {
  return (
    <Provider>
      {({ top, tab, toastMsg }) => {
        const Tab = TABS[tab];
        return (
          <div className="app-root">
            <div className="phone app">
              <StatusBar />
              {top && BARE.has(top.id) ? (
                <div key={top.key} className="screen-in" style={{ display: 'contents' }}>{SCREENS[top.id](top.params)}</div>
              ) : (
                <div className="screen screen-in" key={top ? top.key : tab}>
                  {top ? (SCREENS[top.id] ? SCREENS[top.id](top.params) : null) : <Tab />}
                </div>
              )}
              {!top && <TabBar />}
              {toastMsg && <div className="toast">{toastMsg}</div>}
            </div>
          </div>
        );
      }}
    </Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);

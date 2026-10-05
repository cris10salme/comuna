import { OrderProvider } from './lib/order'
import Header from './components/Header'
import Hero from './components/Hero'
import Facts from './components/Facts'
import Burgers from './components/Burgers'
import Tacos from './components/Tacos'
import Designer from './components/Designer'
import { DessertsAndDrinks, Starters } from './components/SimpleMenus'
import Info from './components/Info'
import Footer from './components/Footer'
import Ticket from './components/Ticket'
import CallBar from './components/CallBar'
import ChatAssistant from './components/ChatAssistant'

export default function App() {
  return (
    <OrderProvider>
      <Header />
      <main>
        <Hero />
        <Facts />
        <Burgers />
        <Designer />
        <Tacos />
        <Starters />
        <DessertsAndDrinks />
        <Info />
      </main>
      <Footer />
      <Ticket />
      <CallBar />
      <ChatAssistant />
    </OrderProvider>
  )
}

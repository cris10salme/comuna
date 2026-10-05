import { OrderProvider } from './lib/order'
import Header from './components/Header'
import Hero from './components/Hero'
import Burgers from './components/Burgers'
import Tacos from './components/Tacos'
import { DessertsAndDrinks, Starters } from './components/SimpleMenus'
import Info from './components/Info'
import Footer from './components/Footer'
import Ticket from './components/Ticket'
import CallBar from './components/CallBar'

export default function App() {
  return (
    <OrderProvider>
      <Header />
      <main>
        <Hero />
        <Burgers />
        <Tacos />
        <Starters />
        <DessertsAndDrinks />
        <Info />
      </main>
      <Footer />
      <Ticket />
      <CallBar />
    </OrderProvider>
  )
}

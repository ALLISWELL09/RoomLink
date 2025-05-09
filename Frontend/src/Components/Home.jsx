import React, { useEffect } from 'react'
import Header from './Header'
import Banner from './Home_Components/Banner'
import Hostel_cards from './Home_Components/Hostel_cards'
import Rating from './Home_Components/Rating'
import GetInTouch from './Home_Components/GetInTouch'
import Footer from './Footer'



export default function Home() {


  return (
    <>
    <div>

        <Header/>
        <Banner/>

       <Hostel_cards/>

        <GetInTouch/>
        <Footer/>




    </div>
    </>
  )
}

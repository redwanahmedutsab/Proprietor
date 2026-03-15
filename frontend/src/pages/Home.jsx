import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import AboutProperty from "../components/AboutProperty"
import Gallery from "../components/Gallery"
import Features from "../components/Features"
import Blog from "../components/Blog"
import Footer from "../components/Footer"

export default function Home() {
    return (
        <>
            <Navbar/>
            <Hero/>
            <AboutProperty/>
            <Gallery/>
            <Features/>
            <Blog/>
            <Footer/>
        </>
    )
}
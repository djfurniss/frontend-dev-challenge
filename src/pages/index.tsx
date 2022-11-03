import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { Lexend } from '@next/font/google';
const lexend = Lexend({ subsets: ['latin'] });
import logo from "../assets/logo.svg";
import search from "../assets/search.svg";
import Image from 'next/image';

export async function getStaticProps() {
  // Call the API endpoint to get the schools
  const res = await fetch('https://api.sendbeacon.com/team/schools')
  const { schools } = await res.json()
  // return 'schools' as a prop
  return {props: { schools } }
};

export default function Home({ schools }: any) {
// --- state hooks ---
  const [searchedSchools, setSearchedSchools] = useState([]);
  const [isLoading, setLoading] = useState(false);

// --- useEffect ---
  useEffect(() => {
    setLoading(true);
    // when the page is loaded, request the user's location
    navigator.permissions.query({name: 'geolocation'})
      .then(({ state }) => {
        // if permissions are not set, a prompt will let the user choose to grant or deny permissions...
        // if the permissions are already granted, the same function still needs to be ran to extract the coordinates
        if (state === "prompt" || state === "granted"){
          // granting permission will run the byDistance callback, denying runs alphabetize
          navigator.geolocation.getCurrentPosition(({ coords })=>byDistance(coords), alphabetize);
        } // the only other state is "denied" which means simply call alphetize to sort the schools alphabetically.
        else alphabetize();
      })
  }, [])
  
// --- helper functions ---
  /**
   * a callback for when the user denies location access, sorts schools in alphabetical order
   */
  const alphabetize = () => {
    schools.sort((schoolA: any, schoolB: any) => {
      return schoolA.name > schoolB.name ? 1 : -1
    });
    setSearchedSchools(schools);
    setLoading(false);
  };

  /**
   * a callback for when the user allows location access, sorts schools closest to farthest from user's location
   * @param coords 
   */
  const byDistance = (coords: any) => {
    const { latitude, longitude } = coords
      schools.sort((a: any, b: any)=>{
        // take the one school, calculate the distance (not just the difference) in longitude and latitude from the user
        let aLatDiff = Math.abs(latitude - a.coordinates.lat);
        let aLongDiff = Math.abs(longitude - a.coordinates.long);
        let aDistance = aLatDiff + aLongDiff;

        // take another school, calculate the distance in longitude and latitude from the user
        let bLatDiff = Math.abs(latitude - b.coordinates.lat);
        let bLongDiff = Math.abs(longitude - b.coordinates.long);
        let bDistance = bLatDiff + bLongDiff;
        
        // return them in order; the lesser number being the closest, the bigger number being the farthest
        return Math.abs(aDistance) - Math.abs(bDistance);
      })
      setSearchedSchools(schools);
      setLoading(false);
  };

// --- handler ---
  const onSearch = ({target}: any) => {
    // filters the directly mutated school data (either by distance or alphabetized) so that whether searching or not, the order is kept intact
    const filteredSearch = schools.filter((school: any) => {
      return school.name.toLowerCase().includes(target.value.toLowerCase());
    });
    setSearchedSchools(filteredSearch);
  };

// --- return ---
  return (
    <main className={`${lexend.className} ${styles.main}`}>
      <header className={styles.header}>
        <Image src={logo} alt="Beacon logo" height={25} width={25} /> 
        <p>BEACON</p>
      </header>
      <h1 className={styles.h1}>Pick Your School</h1>
      <div id={styles.search}>
          <Image src={search} alt="search icon"/>
          <input 
            placeholder='Search for your school'
            onChange={onSearch}/>
      </div>
     
      {isLoading 
        ? <div>
            <p>Loading</p>
            <div className={styles["lds-ring"]}><div></div><div></div><div></div><div></div></div>
          </div>
        : <div className={styles.schoolsDiv}>
          <div id={styles.overlay}></div>
          {searchedSchools.length 
            ? searchedSchools.map((school: any) => {
                return (
                  <div key={school.id} className={styles.school}>
                    <div id={styles.circle}>
                      <p>{school.name[0]}</p>
                    </div>
                    <div className='col'>
                      <p id={styles.name}>{school.name}</p>
                      <p id={styles.county}>{school.county}</p>
                    </div>
                  </div>
                )
              })
            :<p>No schools found</p>}
          </div>
      }
    </main>
  )
};
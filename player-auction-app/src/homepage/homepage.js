// import React from "react";
// import "../css/homepage.css";

// const Homepage = () => {

//     return (
//         <div className="homepage">
//             <h1>Homepage</h1>
//             {/* <h2></h2>
//              */}
//         </div>
//     );
// }

// export default Homepage;

import React from 'react';

const Homepage = ({ userInfo }) => {
    console.log(userInfo);
    // userInfo = JSON.parse(userInfo);
    const info = JSON.parse(userInfo);
   
  return (
    <div>
      {/* <h1>Hello, {userInfo && userInfo.Id}</h1>
       */}
        <h1>Hello, {info && info.Id}</h1>
      {/* Other content */}
    </div>
  );
};

export default Homepage;
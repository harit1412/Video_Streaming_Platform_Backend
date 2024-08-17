const curr = new Date().getTime()



const promise1 = new Promise((resolve, reject) => {
    // setTimeout(resolve, 100, 'first');
    for (let index = 0; index < 1e7; index++) {
      // console.log("Promise1");

    }
    console.log(new Date().getTime() - curr);
    resolve()
  });
  
  const promise2 = new Promise((resolve, reject) => {
    // setTimeout(resolve, 200, 'second');
    for (let index = 0; index < 1e7; index++) {
      // console.log("Promise2");

    }
    console.log(new Date().getTime() - curr);
    resolve()
  });
  
  // const promise3 = new Promise((resolve, reject) => {
  //   // setTimeout(resolve, 300, 'third');
  //   for (let index = 0; index < 1e7; index++) {
  //     // console.log("Promise3");
      
  //   }
  //   console.log(new Date().getTime() - curr);
  //   resolve()
  // });
  
  Promise.all([promise1,promise2])
    .then((results) => {
    //   console.log(results); // ['first', 'second', 'third']
      console.log(new Date().getTime() - curr);
      
    })
    .catch((error) => {
      console.error(error);
    });
  
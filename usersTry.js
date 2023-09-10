const users = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
  );
  const GetAllUser=((req, res)=>{
    res.status(200).json({
      status : 'success',
      UsersCount:users.length,
      data:{
        users:users
      }
    })
  });
  const CreateNewUser=(req, res) => {
    const newId = users[users.length - 1].id + 1;
    const NewUser = Object.assign({ id: newId }, req.body);
  users.push(NewUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          user: NewUser,
        },
      });
    }
  );}
  const GetOneUser=(req, res)=>{
  const id=req.body.id*1;
   if(id>users.length){
        return res.status(400).json({
          status: 'NOT FOUND',
          message: 'invalid ID ',
        
      })
   }
   const user = users.find((el) => el.id === id);
    res.status(200).json({
      status: 'success',
      data: {
        user: user,
      },
    });
  }
  
  //Update user
  const UpdateUser = (req, res) => {
    const id = req.params.id * 1;
    if (id > users.length) {
      return res.status(400).json({
        status: 'NOT FOUND',
        message: 'invalid ID ',
      });
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        tours: 'updatedtour',
      },
    });
  };


  /*  app.get('/api/v1/tours', GetAllTours);
  app.post('/api/v1/tours', CreateNewTour); 
  app.get('/api/v1/tours/:id', GetOneTour);
  app.patch('/api/v1/tours/:id', UpdateTour);
  app.delete('/api/v1/tours/:id',DeleteTour);*/


  /* if(tour){
    res.status(200).json({
      status: 'success',
       data: {
        tour: tour, 
      },
    });
  }
  else{
    res.status(400).json({
      status: 'NOT FOUND',
    
    });
  } */

  //check the id for the routes with param then we call it in the router.params



  exports.checkId = (req, res, next, val) => {
    if (val > tours.length) {
      return res.status(400).json({
        status: 'NOT FOUND',
        message: 'invalid ID ',
      });
    }
    next();
  };
router.param('id', tourController.checkId);

  exports.checkbody = (req, res, next)=>{
    console.log(req.body);
    //can use : !req.body.name
    const hasNameAndPrice = req.body.hasOwnProperty('name') && req.body.hasOwnProperty('price');
    console.log(hasNameAndPrice);
    if(!hasNameAndPrice) {
      return res.status(400).json({
        status: 'Fail',
        message: 'missing name or price ',
      });
    }
    next();
    }

    //in case we have json file instead of the database 
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */ 


exports.CreateNewTour = (req, res) => {
  //console.log(req.body);
 // const newId = tours[tours.length - 1].id + 1;
  //const newTour = Object.assign({ id: newId }, req.body);
 // tours.push(newTour);
  /* fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  ); */
};

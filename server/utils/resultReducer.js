const User = require('../db/models/User.model');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: "quizzard.project@gmail.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
    
  }
});






const forGraded = (quizData) => {
  var amountCorrect = 0;
  let isCorrectArray = quizData.questions.map( question => {
    
    var isTrue = true;
    question.userAnswers.map(answer => {
      
      if(!question.correctAnswers.includes(parseInt(answer))){
        isTrue = false;

      }
    })
    if(isTrue){
      amountCorrect += 1;
    }
    return isTrue;
  })
  var questions = quizData.questions.map ( (question, index) => {

    const answers = question.userAnswers.map( (answer) => {
      return (
        `
          <div>
          <p> ${question.answers[answer].answerContent} (${isCorrectArray[index] ? 'Correct' : 'Incorrect'}) </p>
          </div>
        `
      )
    }).join('');
    return(
        `
        <div >
        <h3> ${index + 1}. ${question.questionContent}</h3>
        
        <h4>User Answer</h4>
        <h5>${answers}</h5>
        <hr/>
        </div>
        `
     )
  }).join('');

  return(
    `
      <div>
      
        <h1>${quizData.quizName}</h1>
        
        <h2>Questions(score - ${ (amountCorrect / isCorrectArray.length * 100).toFixed(0)}%)</h2>
        <hr/>
        <div>
          ${questions}
        </div>
    
    
      </div>
    `
  )

  
}

const forSorted = (quizData) => {
  
    let categoryList = [];
    
    quizData.questions.map(question => {
      question.userAnswers.map(answer => {
        categoryList.push(question.answers[answer].category);
      })
    })

    let categoryScore = quizData.categories.map((category) => {
      return categoryList.filter(categoryItem => categoryItem == category).length;
    })
    const largest = Math.max.apply(Math, categoryScore);
    return(
      `
        <div>
          <h1>${quizData.quizName}</h1>
          <hr/>
          <p>You have been sorted into <h3>${quizData.categories[categoryScore.indexOf(largest)]}</h3> </p>
          
        </div>

      `
    )


  


  
}
const forSurvey = (quizData) => {
  switch(quizData.inputType){
    case 'openEnded': 
      dataToMap = quizData.openEndedInput;
    break;

    default : 
      var questions = quizData.questions.map ( (question, index) => {

        const answers = question.userAnswers.map( (answer, index) => {
          return (
            `
              <div>
              <p> - ${question.answers[answer].answerContent} </p>
              </div>
            `
          )
        }).join('');
        return(
            `
            <div style={"color" : "red"}>
            <h3> ${index + 1}. ${question.questionContent}</h3>
            
            <h4>User Answer</h4>
            <h5>${answers}</h5>
            <hr/>
            </div>
            `
         )
      }).join('');
      break;
  }
    return(
          `
          <div>
            <h1>${quizData.quizName}</h1>
            <h2>Questions</h2>
            <hr/>
              <div>
                ${questions}
              </div>
          </div>
          `
       
    )
}








const resultReducer = (req) => {
  let whoToEmail = [];
  req.body.whoToEmail.map(role => {
    switch(role){
      case 'quizOwner':
        User.findById(req.body.quizOwner).then(quizOwner => {
          whoToEmail.push(quizOwner.email);
        })
        break;
      case 'quizTaker':
        whoToEmail.push(req.body.email);
        break;
    }
  })
  return(
    new Promise(  (resolve, reject) => {
      let emailHtml;
      switch(req.body.quizType){
        case 'graded':
            
            emailHtml = `<h1>${forGraded(req.body)}</h1>`;
          break;
  
        case 'sorted':
            
            emailHtml = `<h1>${forSorted(req.body)}</h1>`;
            break;
  
        case 'survey':
            
            emailHtml = `<h1>${forSurvey(req.body)}</h1>`;
          break;
  
      }
      const mailOptions = {
        from: 'quizzard.project@gmail.com',
        to: whoToEmail,
        subject: 'survey',
        html: emailHtml
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          reject('Error')
        } else {
          console.log('Email sent: ' + info.response);
          resolve('Email sent')
        }
      })
    })
  )
  
} 
    
  



module.exports = {resultReducer};
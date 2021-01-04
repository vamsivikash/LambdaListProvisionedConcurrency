let generatePDF = function generatePDF(){
    return new Promise((resolve, reject) => {
       console.log("I'm in another file ");
       resolve("In another file");
    });
};

module.exports.generatePDF = generatePDF; 
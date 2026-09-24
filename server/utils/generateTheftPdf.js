const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Bike ke asal owner, bike aur theft report ka data le kar ek simple PDF
// file banata hai aur uska file path return karta hai
function generateTheftPdf({ owner, bike, theftReport }) {
  return new Promise((resolve, reject) => {
    const fileName = `theft-report-${theftReport._id}.pdf`;
    const filePath = path.join(__dirname, '..', 'generated-reports', fileName);

    // Folder na ho to bana do
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('Bike theft report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Report ID: ${theftReport._id}`);
    doc.text(`Reported at: ${theftReport.reportedAt.toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Owner details');
    doc.fontSize(11);
    doc.text(`Name: ${owner.name}`);
    doc.text(`Father name: ${owner.fatherName}`);
    doc.text(`CNIC: ${owner.cnic}`);
    doc.text(`Phone: ${owner.phone}`);
    doc.moveDown();

    doc.fontSize(14).text('Bike details');
    doc.fontSize(11);
    doc.text(`Number plate: ${bike.numberPlate}`);
    doc.text(`Color: ${bike.color}`);
    if (bike.make) doc.text(`Make: ${bike.make}`);
    if (bike.model) doc.text(`Model: ${bike.model}`);
    if (bike.chassisNumber) doc.text(`Chassis number: ${bike.chassisNumber}`);
    if (bike.engineNumber) doc.text(`Engine number: ${bike.engineNumber}`);
    doc.moveDown();

    doc.fontSize(14).text('Last known location');
    doc.fontSize(11);
    if (theftReport.lastKnownLocation && theftReport.lastKnownLocation.lat) {
      doc.text(`Latitude: ${theftReport.lastKnownLocation.lat}`);
      doc.text(`Longitude: ${theftReport.lastKnownLocation.lng}`);
      doc.text(`Recorded at: ${new Date(theftReport.lastKnownLocation.timestamp).toLocaleString()}`);
    } else {
      doc.text('Location available nahi thi jab report banaya gaya');
    }

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = generateTheftPdf;
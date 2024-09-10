document.getElementById('generateBtn').addEventListener('click', async function() {
    const data = document.getElementById('dataInput').value.split('\n').map(line => line.trim()).filter(line => line !== '');
    const zip = new JSZip(); // Create a new JSZip instance
    const downloadBtn = document.getElementById('downloadBtn');
    const progressText = document.getElementById('progress');
    const timeRemaining = document.getElementById('timeRemaining');
    const timeValue = document.getElementById('timeValue');
  
    downloadBtn.style.display = 'none'; // Hide the download button initially
    progressText.style.display = 'block'; // Show progress indicator
    timeRemaining.style.display = 'block'; // Show estimated time remaining
  
    if (data.length === 0) {
      alert('Please enter some URLs or text!');
      progressText.style.display = 'none';
      timeRemaining.style.display = 'none';
      return;
    }
  
    const batchSize = 250; // Updated batch size to 250 QR codes per batch
    const totalBatches = Math.ceil(data.length / batchSize);
    const estimatedTimePerBatch = 2; // Estimate time per batch (seconds)
  
    // Estimate total time and update the time remaining UI
    const totalEstimatedTime = totalBatches * estimatedTimePerBatch;
    let remainingTime = totalEstimatedTime;
    timeValue.textContent = remainingTime;
  
    for (let i = 0; i < totalBatches; i++) {
      const batchData = data.slice(i * batchSize, (i + 1) * batchSize);
      await generateBatch(batchData, zip, i * batchSize); // Generate the QR codes in this batch
      
      // Update the remaining time
      remainingTime -= estimatedTimePerBatch;
      timeValue.textContent = remainingTime > 0 ? remainingTime : 0;
      
      progressText.textContent = `Generating QR Codes... Batch ${i + 1} of ${totalBatches}`;
    }
  
    // Once all batches are processed, enable the download button
    downloadBtn.style.display = 'block';
    progressText.textContent = 'QR Codes Generated! Click to download as ZIP.';
    timeRemaining.style.display = 'none'; // Hide time remaining after generation is done
  
    downloadBtn.addEventListener('click', function() {
      // Generate and download the ZIP file when the download button is clicked
      zip.generateAsync({ type: "blob" })
        .then(function(content) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = "qr_codes.zip";
          link.click();
        });
    });
  });
  
  async function generateBatch(batchData, zip, startIndex) {
    let count = startIndex;
  
    for (const item of batchData) {
      if (item) {
        const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item)}`;
  
        // Fetch and add the QR code image to the zip file
        const response = await fetch(qrCodeURL);
        const blob = await response.blob();
        zip.file(`${count + 1}.png`, blob);
        count++;
      }
    }
  }
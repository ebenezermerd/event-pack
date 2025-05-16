require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for confirmation
const askForConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('⚠️ WARNING: This will update controller files to use approvalStatus instead of status. Continue? (yes/no): ', (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
};

// Function to read file contents
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

// Function to write file contents
const writeFile = (filePath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

// Function to update content
const updateContent = (content) => {
  // Replace specific patterns related to event status
  // status: "published" -> approvalStatus: "approved"
  let updatedContent = content.replace(/status: "published"/g, 'approvalStatus: "approved"');
  
  // status: "pending" -> approvalStatus: "pending"
  updatedContent = updatedContent.replace(/status: "pending"/g, 'approvalStatus: "pending"');
  
  // status: "draft" -> approvalStatus: "draft"
  updatedContent = updatedContent.replace(/status: "draft"/g, 'approvalStatus: "draft"');
  
  // status: "cancelled" -> approvalStatus: "cancelled"
  updatedContent = updatedContent.replace(/status: "cancelled"/g, 'approvalStatus: "cancelled"');

  return updatedContent;
};

// Main function to update files
const updateFiles = async () => {
  try {
    console.log('🔄 Starting update process...');

    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('❌ Update cancelled by user.');
      rl.close();
      return;
    }

    // Controller files to update
    const files = [
      '../controllers/eventController.js',
      '../controllers/adminController.js',
      '../controllers/organizerController.js',
    ];

    // Process each file
    for (const file of files) {
      const filePath = path.resolve(__dirname, file);
      
      try {
        if (fs.existsSync(filePath)) {
          console.log(`🔄 Processing ${file}...`);
          
          // Read file content
          const content = await readFile(filePath);
          
          // Update content
          const updatedContent = updateContent(content);
          
          // Write updated content
          await writeFile(filePath, updatedContent);
          
          console.log(`✅ Updated ${file}`);
        } else {
          console.log(`⚠️ File ${file} does not exist, skipping`);
        }
      } catch (fileError) {
        console.error(`❌ Error processing ${file}:`, fileError.message);
      }
    }

    console.log('✅ Update process completed successfully!');
    rl.close();
  } catch (error) {
    console.error('❌ Error during update process:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the update
updateFiles(); 
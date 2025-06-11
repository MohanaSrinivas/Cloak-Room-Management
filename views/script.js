
gsap.from(".hero img", { 
    duration: 2, 
    opacity: 0, 
    y: 50 
  });
  gsap.from(".animate-text span", { 
    duration: 2, 
    opacity: 0, 
    y: 30, 
    delay: 0.5 
  });
  
  // Smooth Scroll Function
  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    window.scrollTo({
      top: section.offsetTop - 60, // Adjust for fixed navbar height
      behavior: "smooth"
    });
  }
  
  
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
  
  console.log("Mobile menu script loaded."); // Debugging line to check if script is loaded
  
  // WebSocket connection
  const socket = new WebSocket('ws://localhost:5002'); // Adjust the URL as needed
  
  socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
  });
  
  socket.addEventListener('message', (event) => {
    console.log(`Message from server: ${event.data}`);
    // Handle incoming messages here
  });
  
  // Function to send messages to the WebSocket server
  function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.error('WebSocket is not open. Unable to send message.');
    }
  }
  
  
  // Mobile Menu and Active Link Functionality
  
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');
  
  // Toggle mobile menu
  mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  
  // Close mobile menu when clicking a link
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove('active');
      }
    });
  });
  
  // Add active class to current section
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    navItems.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section.offsetTop - 60 <= scrollPos && 
          section.offsetTop - 60 + section.offsetHeight > scrollPos) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
  
  // Storage Management System
  let storedItems = [];
  let storageTimer = null;
  
  // Add item storage functionality
  function storeItem(description, quantity, rate, duration) {
    const item = {
      description: description,
      quantity: quantity,
      rate: rate,
      duration: duration,
      checkInTime: new Date(),
      paymentStatus: 'not done'
    };
    
    storedItems.push(item);
    startStorageTimer(item);
    updateStorageStatus();
    updateStoredItemsDisplay();
  }
  
  // Start storage timer
  function startStorageTimer(item) {
    const duration = parseDuration(item.duration);
    storageTimer = setTimeout(() => {
      showCheckoutModal(item);
    }, duration);
  }
  
  // Parse duration string to milliseconds
  function parseDuration(duration) {
    if (duration.includes('hour')) {
      const hours = parseInt(duration);
      return hours * 60 * 60 * 1000;
    } else if (duration.includes('day')) {
      const days = parseInt(duration);
      return days * 24 * 60 * 60 * 1000;
    } else if (duration.includes('week')) {
      const weeks = parseInt(duration);
      return weeks * 7 * 24 * 60 * 60 * 1000;
    }
  }
  
  // Show checkout modal
  function showCheckoutModal(item) {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Checkout Your Items</h3>
        <p>Item: ${item.description}</p>
        <p>Quantity: ${item.quantity}</p>
        <div class="total-cost">
          <h4>Total Cost:</h4>
          <p class="cost-amount">${calculateTotalCost(item)}</p>
        </div>
        <button id="checkout-btn">Proceed to Payment</button>
        <button class="close-modal">&times;</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle checkout
    modal.querySelector('#checkout-btn').addEventListener('click', () => {
      processPayment(item);
      modal.remove();
    });
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  // Calculate total cost
  function calculateTotalCost(item) {
    const rate = parseFloat(item.rate.replace(/[^0-9.]/g, ''));
    const duration = parseDuration(item.duration);
    const hours = duration / (60 * 60 * 1000);
    return `₹${(rate * hours).toFixed(2)}`;
  }
  
  // Process payment
  function processPayment(item) {
    const paymentAmount = calculateTotalCost(item);
    
    // Show admin confirmation modal
    const adminModal = document.createElement('div');
    adminModal.className = 'admin-modal';
    adminModal.innerHTML = `
      <div class="modal-content">
        <h3>Admin Confirmation Required</h3>
        <p>Payment of ${paymentAmount} received?</p>
        <div class="admin-buttons">
          <button id="confirm-payment">Confirm Payment</button>
          <button id="cancel-payment">Cancel Payment</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(adminModal);
    
    // Handle admin confirmation
    adminModal.querySelector('#confirm-payment').addEventListener('click', () => {
      alert(`Payment of ${paymentAmount} confirmed!`);
      removeStoredItem(item);
      adminModal.remove();
      updateStoredItemsDisplay();
    });
    
    // Handle payment cancellation
    adminModal.querySelector('#cancel-payment').addEventListener('click', () => {
      alert('Payment cancelled. Please try again.');
      adminModal.remove();
    });
  }
  
  function updateStoredItemsDisplay() {
    // Update check-in section
    const checkinContainer = document.querySelector('#checkin-section .items-container');
    checkinContainer.innerHTML = storedItems
      .filter(item => item.paymentStatus === 'not done')
      .map((item, index) => `
        <div class="stored-item-card">
          <h3>Item ${index + 1}</h3>
          <p>Description: ${item.description}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Stored Since: ${item.checkInTime.toLocaleString()}</p>
          <p>Rate: ${item.rate}</p>
          <p>Duration: ${item.duration}</p>
          <button class="checkout-btn" data-index="${index}">Checkout</button>
        </div>
      `).join('');
    
    // Add checkout button handlers
    document.querySelectorAll('.checkout-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.dataset.index;
        showCheckoutModal(storedItems[index]);
      });
    });
    
    // Update checkout section
    const checkoutContainer = document.querySelector('#checkout-section .items-container');
    checkoutContainer.innerHTML = storedItems
      .filter(item => item.paymentStatus === 'done')
      .map((item, index) => `
        <div class="stored-item-card">
          <h3>Item ${index + 1}</h3>
          <p>Description: ${item.description}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Stored Since: ${item.checkInTime.toLocaleString()}</p>
          <p>Rate: ${item.rate}</p>
          <p>Duration: ${item.duration}</p>
          <p class="payment-status done">Payment Done</p>
        </div>
      `).join('');
    
    // Update storage status
    updateStorageStatus();
  }
  
  // Remove stored item
  function removeStoredItem(item) {
    storedItems = storedItems.filter(i => i !== item);
    updateStorageStatus();
  }
  
  // Update storage status display
  function updateStorageStatus() {
    const statusElement = document.getElementById('storage-status');
    if (!statusElement) return;
    
    if (storedItems.length > 0) {
      statusElement.innerHTML = `
        <div class="storage-summary">
          <p>You have ${storedItems.length} items in storage</p>
          <button id="view-items">View Items</button>
        </div>
      `;
      
      // Add click handler for view items
      statusElement.querySelector('#view-items').addEventListener('click', () => {
        showStoredItems();
      });
    } else {
      statusElement.innerHTML = 'No items currently in storage';
    }
  }
  
  function showStoredItems() {
    const modal = document.createElement('div');
    modal.className = 'items-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Stored Items</h3>
        <div class="items-list">
          ${storedItems.map((item, index) => `
            <div class="stored-item">
              <p><strong>Item ${index + 1}:</strong> ${item.description}</p>
              <p>Quantity: ${item.quantity}</p>
              <p>Stored Since: ${item.checkInTime.toLocaleString()}</p>
              <p>Rate: ${item.rate}</p>
              <p>Duration: ${item.duration}</p>
            </div>
          `).join('')}
        </div>
        <button class="close-modal">&times;</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  // Get existing sections from the page
  const checkinSection = document.getElementById('checkin-section');
  const checkoutSection = document.getElementById('checkout-section');
  
  // Add items containers to existing sections
  checkinSection.innerHTML += `
    <div class="stored-items">
      <h3>Currently Stored Items</h3>
      <div class="items-container"></div>
    </div>
  `;
  
  checkoutSection.innerHTML += `
    <div class="stored-items">
      <h3>Completed Checkouts</h3>
      <div class="items-container"></div>
    </div>
  `;
  
  // Add storage status to UI
  const statusElement = document.createElement('div');
  statusElement.id = 'storage-status';
  statusElement.style.position = 'fixed';
  statusElement.style.bottom = '20px';
  statusElement.style.right = '20px';
  statusElement.style.padding = '10px 20px';
  statusElement.style.backgroundColor = '#0078d4';
  statusElement.style.color = 'white';
  statusElement.style.borderRadius = '5px';
  document.body.appendChild(statusElement);
  updateStorageStatus();
  updateStoredItemsDisplay();
  
  // Add modal styles
  const style = document.createElement('style');
  style.textContent = `
    .storage-modal, .checkout-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 10px;
      width: 300px;
      position: relative;
    }
    
    .close-modal {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    
    #storage-form input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    
    #storage-form button, #checkout-btn {
      width: 100%;
      padding: 10px;
      background: #0078d4;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
  
  function handleCheckIn() {
    const description = prompt("Enter item description:");
    const quantity = parseInt(prompt("Enter quantity:"));
    const rate = prompt("Enter storage rate (e.g., ₹20/hour):");
    const duration = prompt("Enter duration (e.g., 1 hour):");
    storeItem(description, quantity, rate, duration);
  }
  
  function handleCheckOut() {
    const itemIndex = parseInt(prompt("Enter the index of the item to check out:")) - 1;
    if (storedItems[itemIndex]) {
      showCheckoutModal(storedItems[itemIndex]);
    } else {
      alert("Invalid item index.");
    }
  }
  
  function handleStoreNow() {
    const description = prompt("Enter item description:");
    const quantity = parseInt(prompt("Enter quantity:"));
    const rate = prompt("Enter storage rate (e.g., ₹20/hour):");
    const duration = prompt("Enter duration (e.g., 1 hour):");
    storeItem(description, quantity, rate, duration);
    updateStoredItemsDisplay();
  }
  
  // Populate the Stored Items section dynamically
  function populateStoredItems() {
    const container = document.getElementById('stored-items-container');
    if (storedItems.length === 0) {
      container.innerHTML = "<p>No items currently stored.</p>";
    } else {
      container.innerHTML = storedItems
        .map(
          (item, index) => `
          <div class="stored-item-card">
            <h3>Item ${index + 1}</h3>
            <p>Description: ${item.description}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Rate: ${item.rate}</p>
            <p>Duration: ${item.duration}</p>
            <button onclick="handleCheckOut(${index})">Check Out</button>
            <button onclick="removeStoredItem(${index})">Remove</button>
          </div>
        `
        )
        .join('');
    }
  }
  
  // Call the function to populate the Stored Items section
  populateStoredItems();
  
  // Chat Assistant Functionality
  const chatButton = document.getElementById('chatButton');
  const chatModal = document.getElementById('chatModal');
  const chatMessages = document.getElementById('chatMessages');
  const userMessageInput = document.getElementById('userMessage');
  const sendMessageButton = document.getElementById('sendMessage');
  const closeChatButton = document.querySelector('.close-chat');
  
  // Toggle chat modal with animation
  if (chatButton) {
    chatButton.addEventListener('click', () => {
      if (chatModal.style.display === 'flex') {
        // Slide out animation
        chatModal.style.transform = 'translateX(100%)';
        setTimeout(() => {
          chatModal.style.display = 'none';
          chatModal.style.transform = 'translateX(0)';
        }, 300);
      } else {
        // Slide in animation
        chatModal.style.display = 'flex';
        chatModal.style.transform = 'translateX(100%)';
        setTimeout(() => {
          chatModal.style.transform = 'translateX(0)';
        }, 10);
        
        if (chatMessages.children.length === 0) {
          setTimeout(() => {
            addMessageToChat("Hello! I'm your Cloakroom Assistant. How can I help you today?", 'bot');
          }, 500);
        }
      }
    });
  }
  
  // Close chat modal
  if (closeChatButton) {
    closeChatButton.addEventListener('click', () => {
      chatModal.style.display = 'none';
    });
  }
  
  // Add message to chat UI
  function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `
      <div class="message-content">${message}</div>
      <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot typing';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `
      <div class="message-content">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
  }
  
  // Generate bot response
  function generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I help you with your cloakroom needs today?";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our pricing starts at ₹20 per bag per hour. We also offer daily and weekly rates.";
    } else if (lowerMessage.includes('store') || lowerMessage.includes('check-in')) {
      return "You can check-in your items by clicking the 'Check-In Now' button in the Luggage Services section.";
    } else if (lowerMessage.includes('retrieve') || lowerMessage.includes('check-out')) {
      return "To retrieve your items, click the 'Check-Out Now' button and present your QR code.";
    } else if (lowerMessage.includes('security')) {
      return "All items are stored in individual lockers with 24/7 monitoring for maximum security.";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Let me know if you need any further assistance.";
    } else {
      return "I'm here to help with your cloakroom needs. You can ask about pricing, storage, or retrieval.";
    }
  }
  
  // Send message function
  function sendChatMessage() {
    const message = userMessageInput.value.trim();
    if (message) {
      addMessageToChat(message, 'user');
      userMessageInput.value = '';
      
      showTypingIndicator();
      
      setTimeout(() => {
        removeTypingIndicator();
        const botResponse = generateBotResponse(message);
        addMessageToChat(botResponse, 'bot');
      }, 1000 + Math.random() * 2000);
    }
  }
  
  // Event listeners for sending messages
  if (sendMessageButton && userMessageInput) {
    sendMessageButton.addEventListener('click', sendChatMessage);
    userMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
  
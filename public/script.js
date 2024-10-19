const groupList = document.getElementById('groupList');
const groupNameInput = document.getElementById('groupName');
const messageInput = document.getElementById('message');
const statusDiv = document.getElementById('status');
const qrCodeDiv = document.getElementById('qrCode'); // New element for QR code

let groups = [];

// Fetch and display QR code
const fetchQRCode = () => {
    fetch('/qr-code')
        .then(response => response.json())
        .then(data => {
            if (data.qrCode) {
                qrCodeDiv.innerHTML = `<img src="${data.qrCode}" alt="QR Code" style="width: 200px; height: 200px;">`;
            }
        })
        .catch(err => {
            console.error('Error fetching QR code:', err);
        });
};

// Call fetchQRCode periodically to update QR code if needed
setInterval(fetchQRCode, 3000); // Fetch every 5 mins

// Event listener to add a group
document.getElementById('addGroup').addEventListener('click', () => {
    const groupName = groupNameInput.value.trim();
    if (groupName && !groups.includes(groupName)) {
        groups.push(groupName);
        updateGroupList();
        groupNameInput.value = '';
    }
});

// Function to update the group list
function updateGroupList() {
    groupList.innerHTML = '';
    groups.forEach((group, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';

        li.textContent = group;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '10px';
        removeBtn.style.width = '80px';
        removeBtn.style.padding = '5px';
        removeBtn.style.fontSize = '0.8em';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = () => {
            groups.splice(index, 1);
            updateGroupList();
        };

        li.appendChild(removeBtn);
        groupList.appendChild(li);
    });
}

document.getElementById('logoutButton').addEventListener('click', () => {
    fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(data => {
        statusDiv.textContent = data.status;
    })
    .catch(err => {
        console.error(err);
        statusDiv.textContent = 'Error during logout.';
    });
});


// Event listener to send notifications
document.getElementById('sendNotification').addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (groups.length > 0 && message) {
        fetch('/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groups, message }),
        })
        .then(response => response.json())
        .then(data => {
            statusDiv.textContent = data.status;
            messageInput.value = '';
        })
        .catch(err => {
            console.error(err);
            statusDiv.textContent = 'Error sending notification.';
        });
    } else {
        statusDiv.textContent = 'Please add groups and enter a message.';
    }
});

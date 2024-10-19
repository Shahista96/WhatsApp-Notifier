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
    const selectedPredefinedGroups = Array.from(document.querySelectorAll('.predefined-group-checkbox:checked')).map(checkbox => checkbox.value);
    const allGroups = [...groups, ...selectedPredefinedGroups]; // Combine newly added and selected predefined groups

    if (allGroups.length > 0 && message) {
        fetch('/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groups: allGroups, message }),
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

document.getElementById('selectAllButton').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.predefined-group-checkbox');
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);

    checkboxes.forEach(checkbox => {
        checkbox.checked = !allSelected; // If all are selected, deselect; otherwise, select all
    });
});



const predefinedGroups = [
    'Test',
    'Test1'
];

// Function to render predefined groups with checkboxes
function renderPredefinedGroups() {
    const predefinedGroupsDiv = document.getElementById('predefinedGroups');
    predefinedGroupsDiv.innerHTML = '';

    predefinedGroups.forEach(group => {
        const container = document.createElement('div'); // Flex container
        container.style.display = 'flex'; // Use flexbox for alignment
        container.style.justifyContent = 'space-between'; // Space between elements
        container.style.alignItems = 'center'; // Center items vertically
        container.style.marginBottom = '5px'; // Add some spacing between rows

        const label = document.createElement('label');
        label.textContent = group;
        label.style.flex = '1'; // Allow the label to take available space
        label.style.marginRight = '10px'; // Optional spacing between label and checkbox

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = group;
        checkbox.className = 'predefined-group-checkbox'; // Class for easy selection later

        container.appendChild(label);
        container.appendChild(checkbox);

        predefinedGroupsDiv.appendChild(container);
    });
}

// Call the function to render the predefined groups on page load
renderPredefinedGroups();




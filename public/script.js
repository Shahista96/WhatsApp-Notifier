const groupList = document.getElementById('groupList');
const groupNameInput = document.getElementById('groupName');
const messageInput = document.getElementById('message');
const statusDiv = document.getElementById('status');

let groups = [];

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
        li.style.display = 'flex'; // Use flexbox for layout
        li.style.alignItems = 'center'; // Center items vertically
        li.style.justifyContent = 'space-between'; // Space between text and button

        li.textContent = group; // Display group name

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '10px'; // Space between name and button
        removeBtn.style.width = '80px'; // Fixed width for the button
        removeBtn.style.padding = '5px'; // Padding
        removeBtn.style.fontSize = '0.8em'; // Smaller font size
        removeBtn.style.backgroundColor = 'red'; // Red background
        removeBtn.style.color = 'white'; // White text color
        removeBtn.style.border = 'none'; // No border
        removeBtn.style.cursor = 'pointer'; // Pointer cursor
        removeBtn.onclick = () => {
            groups.splice(index, 1);
            updateGroupList();
        };

        li.appendChild(removeBtn); // Append button to list item
        groupList.appendChild(li); // Append list item to group list
    });
}

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

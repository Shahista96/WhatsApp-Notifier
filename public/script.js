const groupList = document.getElementById('groupList');
const groupNameInput = document.getElementById('groupName');
const messageInput = document.getElementById('message');
const statusDiv = document.getElementById('status');

let groups = [];

document.getElementById('addGroup').addEventListener('click', () => {
    const groupName = groupNameInput.value.trim();
    if (groupName && !groups.includes(groupName)) {
        groups.push(groupName);
        updateGroupList();
        groupNameInput.value = '';
    }
});

function updateGroupList() {
    groupList.innerHTML = '';
    groups.forEach((group, index) => {
        const li = document.createElement('li');
        li.textContent = group;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            groups.splice(index, 1);
            updateGroupList();
        };
        li.appendChild(removeBtn);
        groupList.appendChild(li);
    });
}

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
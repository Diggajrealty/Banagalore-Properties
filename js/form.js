// Form JavaScript

function openModal(projectName = '') {
    const modal = document.getElementById('enquiryModal');
    modal.classList.add('active');
    
    if (projectName) {
        const select = document.getElementById('projectSelect');
        if(select) {
            // Check if option exists, if not add it
            let exists = false;
            for(let i=0; i<select.options.length; i++) {
                if(select.options[i].value === projectName) {
                    exists = true;
                    break;
                }
            }
            if(!exists) {
                const option = document.createElement('option');
                option.value = projectName;
                option.text = projectName;
                select.add(option);
            }
            select.value = projectName;
        }
    }
}

function closeModal() {
    const modal = document.getElementById('enquiryModal');
    modal.classList.remove('active');
    
    // Reset form state after close
    setTimeout(() => {
        document.getElementById('enquiryForm').style.display = 'block';
        document.getElementById('thankYouMessage').style.display = 'none';
        document.getElementById('enquiryForm').reset();
    }, 300);
}

function submitForm(event) {
    event.preventDefault();
    
    // Simple client side validation is handled by HTML5 attributes
    
    // Hide form, show thank you
    document.getElementById('enquiryForm').style.display = 'none';
    document.getElementById('thankYouMessage').style.display = 'block';
    
    // Close modal after 3 seconds
    setTimeout(() => {
        closeModal();
    }, 3000);
}
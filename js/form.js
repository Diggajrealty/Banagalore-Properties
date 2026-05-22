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

async function submitForm(event) {
    event.preventDefault();

    const form = document.getElementById('enquiryForm');
    const formData = new FormData(form);

    // Submit to Netlify Forms via AJAX
    try {
        await fetch(window.location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        });
    } catch (e) {
        console.warn('Netlify form submit error:', e);
    }

    // Hide form, show thank you
    document.getElementById('enquiryForm').style.display = 'none';
    document.getElementById('thankYouMessage').style.display = 'block';

    // Close modal after 3 seconds
    setTimeout(() => {
        closeModal();
    }, 3000);
}

// Sidebar enquiry form on property pages (AJAX submit → Netlify)
async function submitEnquiry(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"], button:not([type])');

    // Show loading state
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }

    try {
        await fetch(window.location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        });

        // Show success
        form.innerHTML = `
            <div style="text-align:center; padding: 20px 0;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">✅</div>
                <h4 style="color: #C9A84C; margin-bottom: 8px;">Request Received!</h4>
                <p style="color: rgba(255,255,255,0.8); font-size: 0.95rem;">Our senior advisor will call you within <strong>15 minutes</strong>.</p>
            </div>`;
    } catch (e) {
        if (submitBtn) {
            submitBtn.textContent = 'Request Details Instantly';
            submitBtn.disabled = false;
        }
        console.warn('Enquiry form error:', e);
    }
}
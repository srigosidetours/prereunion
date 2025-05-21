// /app/js/components/AddActivityForm.js
class AddActivityForm extends HTMLElement {
    constructor() {
        super();
        // No shadow DOM
        this.userData = this.getCurrentUserData();
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();

        // Listen for user identification to enable/disable form or update internal state
        document.addEventListener('useridentified', (e) => {
            this.userData = e.detail;
            this.render(); // Re-render to enable form if it was disabled
            this.addEventListeners();
        });
        document.addEventListener('usercleared', () => {
            this.userData = null;
            this.render(); // Re-render to disable form
            this.addEventListeners();
        });
    }

    getCurrentUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    render() {
        let content = '';
        if (!this.userData) {
            content = `
                <p><em>Debes introducir tus datos arriba para poder añadir actividades.</em></p>
            `;
        } else {
            content = `
                <form id="add-activity-actual-form">
                    <label for="activity-description">Descripción de la actividad:</label>
                    <input type="text" id="activity-description" name="description" required>
                    <button type="submit">Añadir Actividad</button>
                </form>
            `;
        }
        this.innerHTML = content;
    }

    addEventListeners() {
        const form = this.querySelector('#add-activity-actual-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (!this.userData) {
            alert('Por favor, introduce tus datos antes de añadir una actividad.');
            return;
        }

        const descriptionInput = this.querySelector('#activity-description');
        const description = descriptionInput.value.trim();

        if (!description) {
            alert('La descripción no puede estar vacía.');
            return;
        }

        const formData = new FormData();
        formData.append('action', 'addActivity'); // Matches PHP action
        formData.append('description', description);
        formData.append('userName', this.userData.name);
        formData.append('userSurname', this.userData.surname);
        formData.append('userOffice', this.userData.office);

        try {
            const response = await fetch('index.php', { // API endpoint
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error adding activity: ${response.status} ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                descriptionInput.value = ''; // Clear input field
                // Dispatch an event on the parent element of this component (e.g., a section)
                // so that activity-list can listen to it.
                this.parentElement.dispatchEvent(new CustomEvent('activityadded', {
                    bubbles: true, // Allow event to bubble up
                    composed: true // Allow event to cross shadow DOM boundaries (though not used here)
                }));
                // console.log('Activity added successfully, event dispatched.');
            } else {
                throw new Error(result.message || 'Failed to add activity.');
            }
        } catch (error) {
            console.error('Add activity error:', error);
            alert(`Error al añadir actividad: ${error.message}`);
        }
    }
}

// Define the custom element
if (window.customElements && !customElements.get('add-activity-form')) {
    customElements.define('add-activity-form', AddActivityForm);
}
```

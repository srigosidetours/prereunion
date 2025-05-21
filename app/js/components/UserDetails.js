// /app/js/components/UserDetails.js
class UserDetails extends HTMLElement {
    constructor() {
        super();
        // No shadow DOM for easier global CSS application from mvp.css and custom.css
        // this.attachShadow({ mode: 'open' }); 
        this.userData = this.getUserData();
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
        // Remove loading state from body if this is the main component loading
        document.body.classList.remove('loading');
    }

    getUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    saveUserData(name, surname, office) {
        const userData = { name, surname, office };
        localStorage.setItem('userData', JSON.stringify(userData));
        this.userData = userData;
    }

    render() {
        let content = '';
        if (this.userData) {
            content = `
                <div>
                    <p>Bienvenido/a, <strong>${this.escapeHTML(this.userData.name)} ${this.escapeHTML(this.userData.surname)}</strong> (${this.escapeHTML(this.userData.office)})</p>
                    <button id="clear-user-data">Cambiar Usuario</button>
                </div>
            `;
        } else {
            content = `
                <form id="user-form">
                    <fieldset>
                        <legend>Introduce tus datos</legend>
                        <label for="name">Nombre:</label>
                        <input type="text" id="name" name="name" required>
                        
                        <label for="surname">Apellidos:</label>
                        <input type="text" id="surname" name="surname" required>
                        
                        <label for="office">Oficina:</label>
                        <input type="text" id="office" name="office" required>
                        
                        <button type="submit">Guardar Datos</button>
                    </fieldset>
                </form>
            `;
        }
        this.innerHTML = content;
    }

    addEventListeners() {
        const userForm = this.querySelector('#user-form');
        if (userForm) {
            userForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const name = event.target.name.value.trim();
                const surname = event.target.surname.value.trim();
                const office = event.target.office.value.trim();
                if (name && surname && office) {
                    this.saveUserData(name, surname, office);
                    this.render(); // Re-render to show welcome message
                    this.addEventListeners(); // Re-add listeners if elements changed
                    // Dispatch an event that other components might listen to
                    this.dispatchEvent(new CustomEvent('useridentified', { bubbles: true, composed: true, detail: this.userData }));
                }
            });
        }

        const clearButton = this.querySelector('#clear-user-data');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                localStorage.removeItem('userData');
                this.userData = null;
                this.render(); // Re-render to show the form
                this.addEventListeners(); // Re-add listeners
                // Dispatch an event that other components might listen to
                this.dispatchEvent(new CustomEvent('usercleared', { bubbles: true, composed: true }));
            });
        }
    }

    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Define the custom element
if (window.customElements && !customElements.get('user-details')) {
    customElements.define('user-details', UserDetails);
}

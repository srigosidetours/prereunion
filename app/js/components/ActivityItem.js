// /app/js/components/ActivityItem.js
class ActivityItem extends HTMLElement {
    constructor() {
        super();
        // No shadow DOM for global CSS from mvp.css and custom.css
        this._activity = null; 
        this._currentUser = this.getCurrentUserData(); // To check ownership for deletion
    }

    static get observedAttributes() {
        return ['id', 'description', 'status', 'creation-date', 'user-name', 'user-surname', 'user-office', 'soft-deleted'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Basic way to keep internal state in sync with attributes
        // More complex components might parse/validate values here
        // Avoid re-rendering if the new value is the same as what _activity would produce
        // This check is basic; for complex objects, a deep comparison might be needed.
        if (this._activity && this.activity[name.replace(/-/g, '_')] === newValue) {
            return;
        }
        this.render();
    }
    
    connectedCallback() {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'listitem');
        }
        // Ensure current user data is fresh if component is re-added to DOM
        this._currentUser = this.getCurrentUserData(); 
        this.render();
        this.addEventListeners();
    }

    set activity(data) {
        this._activity = data;
        // Set attributes from the data object to make them observable and for clarity if inspected
        if (data) {
            this.setAttribute('id', data.id);
            this.setAttribute('description', data.description);
            this.setAttribute('status', data.status);
            this.setAttribute('creation-date', data.creation_date);
            if(data.user_name) this.setAttribute('user-name', data.user_name);
            if(data.user_surname) this.setAttribute('user-surname', data.user_surname);
            if(data.user_office) this.setAttribute('user-office', data.user_office);
            // Ensure soft_deleted is '1' or '0' string for attribute
            this.setAttribute('soft-deleted', data.soft_deleted ? '1' : '0');
        }
        this.render();
        this.addEventListeners(); // Re-attach listeners as render clears innerHTML
    }

    get activity() {
        // Prefer _activity object if it exists, otherwise build from attributes
        return this._activity || this.getActivityDataFromAttributes();
    }

    getActivityDataFromAttributes() {
        // This is a fallback or initialization mechanism if _activity is not set directly
        const data = {
            id: this.getAttribute('id'),
            description: this.getAttribute('description'),
            status: this.getAttribute('status'),
            creation_date: this.getAttribute('creation-date'),
            user_name: this.getAttribute('user-name'),
            user_surname: this.getAttribute('user-surname'),
            user_office: this.getAttribute('user-office'),
            soft_deleted: this.getAttribute('soft-deleted') === '1'
        };
        // If id is null, it means attributes are not fully set, return null
        return data.id ? data : null;
    }

    getCurrentUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    isOwnedByUser() {
        if (!this._currentUser || !this.activity) return false;
        const act = this.activity; // Use the getter to ensure we have activity data
        return act.user_name === this._currentUser.name &&
               act.user_surname === this._currentUser.surname &&
               act.user_office === this._currentUser.office;
    }

    render() {
        const act = this.activity; // Use the getter
        if (!act || !act.id) { 
            this.innerHTML = '<p>Cargando actividad...</p>'; // Or some placeholder
            return;
        }

        const creationDate = new Date(act.creation_date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
        const isCompleted = act.status === 'completed';
        
        // Determine if admin view specific attributes are present
        const isAdminView = this.closest('admin-activity-list') !== null;
        let userDisplay = '';
        if (isAdminView && act.user_name) {
            userDisplay = ` <small class="activity-user">(${this.escapeHTML(act.user_name)} ${this.escapeHTML(act.user_surname)} - ${this.escapeHTML(act.user_office)})</small>`;
        }
        
        let statusDisplay = this.escapeHTML(act.status);
        this.style.opacity = '1'; // Reset opacity
        if (act.soft_deleted) {
            statusDisplay += ' (Borrado)';
            this.style.opacity = '0.6';
        }


        this.innerHTML = `
            <article class="activity-item-article ${act.soft_deleted ? 'soft-deleted' : ''} status-${this.escapeHTML(act.status)}">
                <header>
                    <h4>${this.escapeHTML(act.description)} ${userDisplay}</h4>
                </header>
                <p>
                    <small>Fecha: ${creationDate}</small><br>
                    Estado: <mark>${statusDisplay}</mark>
                </p>
                <footer>
                    ${!act.soft_deleted && !isAdminView ? `
                        <button class="status-toggle" data-id="${act.id}" data-current-status="${this.escapeHTML(act.status)}">
                            ${isCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                        </button>
                        ${this.isOwnedByUser() ? `<button class="delete-activity" data-id="${act.id}">Borrar</button>` : ''}
                    ` : ''}
                    
                    ${isAdminView && !act.soft_deleted ? `
                        <select class="admin-status-change" data-id="${act.id}">
                            <option value="pending" ${act.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                            <option value="completed" ${act.status === 'completed' ? 'selected' : ''}>Completada</option>
                            <option value="approved" ${act.status === 'approved' ? 'selected' : ''}>Aprobar</option>
                            <option value="rejected" ${act.status === 'rejected' ? 'selected' : ''}>Rechazar</option>
                        </select>
                        <!-- Hard delete can be added here if needed by admin -->
                    ` : ''}
                     ${isAdminView && act.soft_deleted ? `<small>Esta actividad fue borrada por el usuario.</small>` : ''}
                </footer>
            </article>
        `;
    }

    addEventListeners() {
        // For User View
        const statusToggleButton = this.querySelector('.status-toggle');
        if (statusToggleButton) {
            statusToggleButton.addEventListener('click', (e) => {
                const activityId = e.target.dataset.id;
                const currentStatus = e.target.dataset.currentStatus;
                const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
                this.dispatchEvent(new CustomEvent('activitystatuschange', {
                    bubbles: true,
                    composed: true,
                    detail: { id: activityId, status: newStatus }
                }));
            });
        }

        const deleteButton = this.querySelector('.delete-activity');
        if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
                if (confirm('¿Estás seguro de que quieres borrar esta actividad?')) {
                    const activityId = e.target.dataset.id;
                    this.dispatchEvent(new CustomEvent('activitydelete', {
                        bubbles: true,
                        composed: true,
                        detail: { id: activityId }
                    }));
                }
            });
        }

        // For Admin View
        const adminStatusSelect = this.querySelector('.admin-status-change');
        if (adminStatusSelect) {
            adminStatusSelect.addEventListener('change', (e) => {
                const activityId = e.target.dataset.id;
                const newStatus = e.target.value;
                this.dispatchEvent(new CustomEvent('adminactivitystatuschange', {
                    bubbles: true,
                    composed: true,
                    detail: { id: activityId, status: newStatus }
                }));
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
if (window.customElements && !customElements.get('activity-item')) {
    customElements.define('activity-item', ActivityItem);
}
```

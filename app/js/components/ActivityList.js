// /app/js/components/ActivityList.js
class ActivityList extends HTMLElement {
    constructor() {
        super();
        // No shadow DOM
        this._activities = [];
        this.userData = this.getCurrentUserData();
    }

    connectedCallback() {
        this.render(); // Initial render might show "Please register" or "Loading"
        this.fetchActivities();

        // Listen for events that require the list to refresh
        document.addEventListener('useridentified', (e) => {
            this.userData = e.detail;
            this.fetchActivities();
        });
        document.addEventListener('usercleared', () => {
            this.userData = null;
            this._activities = [];
            this.render();
        });
        // Listen for when a new activity is added externally (e.g., by add-activity-form)
        // Assuming AddActivityForm is a sibling or in a structure where parentElement makes sense.
        if (this.parentElement) {
            this.parentElement.addEventListener('activityadded', () => this.fetchActivities());
        }
        
        // Listen for changes from activity-item children
        this.addEventListener('activitystatuschange', this.handleActivityStatusChange.bind(this));
        this.addEventListener('activitydelete', this.handleActivityDelete.bind(this));
    }

    getCurrentUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    async fetchActivities() {
        if (!this.userData) {
            this._activities = [];
            this.render(); // This will show the "Please register..." message
            return;
        }

        this.innerHTML = '<p>Cargando actividades...</p>'; // Loading indicator

        try {
            // Construct query parameters for GET request
            const params = new URLSearchParams({
                action: 'getActivities', // Matches PHP action
                userName: this.userData.name,
                userSurname: this.userData.surname,
                userOffice: this.userData.office,
                // includeSoftDeleted: 'false' // PHP default is false, so not strictly needed here
            });

            const response = await fetch(`index.php?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' 
                    // Accept header might be useful too: 'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error fetching activities: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.activities)) {
                this._activities = data.activities;
            } else if (data.success === false) { // Explicit failure from backend
                console.warn(data.message || 'Failed to retrieve activities.');
                this._activities = []; 
            } else { // Unexpected response structure
                 this._activities = []; 
            }
        } catch (error) {
            console.error('Fetch activities error:', error);
            this.innerHTML = `<p style="color: red;">Error al cargar actividades: ${error.message}. Verifique la consola para más detalles.</p>`;
            this._activities = []; // Clear activities on error
        }
        this.render();
    }

    async handleActivityStatusChange(event) {
        const { id, status } = event.detail;
        if (!this.userData) return; // Safety check

        try {
            const formData = new FormData();
            formData.append('action', 'updateActivityStatus');
            formData.append('activityId', id);
            formData.append('status', status);
            // User details for this action are not strictly necessary if PHP action relies on activityId only
            // but could be added for extra validation if needed.

            const response = await fetch('index.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error updating status: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            if (result.success) {
                // Optimistic update could be done here for faster UI response
                // For now, just re-fetch
                this.fetchActivities(); 
            } else {
                throw new Error(result.message || 'Failed to update status.');
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert(`Error al actualizar estado: ${error.message}`);
        }
    }

    async handleActivityDelete(event) {
        const { id } = event.detail;
        if (!this.userData) return; 

        try {
            const formData = new FormData();
            formData.append('action', 'softDeleteActivity');
            formData.append('activityId', id);
            formData.append('userName', this.userData.name);
            formData.append('userSurname', this.userData.surname);
            formData.append('userOffice', this.userData.office);

            const response = await fetch('index.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error deleting activity: ${response.status} ${errorText}`);
            }
            const result = await response.json();
            if (result.success) {
                this.fetchActivities(); // Refresh list
            } else {
                throw new Error(result.message || 'Failed to delete activity.');
            }
        } catch (error) {
            console.error('Delete activity error:', error);
            alert(`Error al borrar actividad: ${error.message}`);
        }
    }

    render() {
        // Message for when no user is identified
        if (!this.userData) {
            this.innerHTML = '<p>Por favor, introduce tus datos para ver o añadir actividades.</p>';
            return;
        }

        // Message for loading (already set by fetchActivities, but good to have a check)
        // This specific check might be redundant if fetchActivities always sets innerHTML before calling render.
        if (this.innerHTML.includes('Cargando actividades...') && this._activities.length === 0) {
            // Keep loading message if still loading and no activities yet.
            // If fetch finishes and there are no activities, the next block handles it.
            return; 
        }
        
        // Clear loading message or previous content
        this.innerHTML = ''; 

        if (this._activities.length === 0) {
            this.innerHTML = '<p>No tienes actividades programadas. ¡Añade una nueva!</p>';
            return;
        }
        
        const listElement = document.createElement('div');
        listElement.setAttribute('role', 'list');

        this._activities
            .filter(activityData => activityData.soft_deleted === 0 || activityData.soft_deleted === "0" || !activityData.soft_deleted) // Ensure correct filtering
            .forEach(activityData => {
                const item = document.createElement('activity-item');
                item.activity = activityData; // Use the setter in ActivityItem
                listElement.appendChild(item);
            });
        
        if (listElement.children.length === 0 && this._activities.length > 0) {
            // This means all activities are soft-deleted
            this.innerHTML = '<p>Todas tus actividades han sido borradas. ¡Añade una nueva!</p>';
        } else {
            this.appendChild(listElement);
        }
    }
}

// Define the custom element
if (window.customElements && !customElements.get('activity-list')) {
    customElements.define('activity-list', ActivityList);
}
```

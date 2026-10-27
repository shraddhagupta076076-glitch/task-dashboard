import initialData from '../../data/initialData.json';

/**
 * Service to hydrate the application with initial sample data
 */
export const DataHydrationService = {
  /**
   * Load sample task lists into the application
   * @returns {Array} Array of sample task lists
   */
  getInitialTaskLists: () => {
    return initialData.taskLists;
  },

  /**
   * Load sample tags into the application
   * @returns {Array} Array of sample tags
   */
  getInitialTags: () => {
    return initialData.tags;
  },

  /**
   * Load sample tasks into the application
   * @returns {Array} Array of sample tasks
   */
  getInitialTasks: () => {
    return initialData.tasks;
  },

  /**
   * Check if the application should be hydrated with sample data
   * This can be expanded to check localStorage or other conditions
   * @returns {boolean}
   */
  shouldHydrate: () => {
    // Check if the VITE_ENABLE_DATA_HYDRATION environment variable is set to 'true'
    // This allows controlling hydration via build configuration or environment
    return import.meta.env.VITE_ENABLE_DATA_HYDRATION === 'true';
  }
};
onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {authLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                  {authLoading ? 'Sending...' : 'Send Reset Email'}
                </button>

                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthView('signin')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Access</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div><strong>Admin:</strong> mmills@consulex.com</div>
                <div><strong>Password:</strong> Corrosion.2012</div>
              </div>
              <button
                onClick={() => {
                  setAuthForm({
                    email: 'mmills@consulex.com',
                    password: 'Corrosion.2012',
                    fullName: '',
                    company: ''
                  });
                  setAuthView('signin');
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Use demo credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app (authenticated user)
  const projectStats = getProjectStats();
  const analytics = getAdvancedAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="text-blue-600" />
              Project Tracker Pro
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {userProfile?.role === 'admin' ? 'Admin' : 'Pro'}
              </span>
            </h1>
            <p className="text-gray-600">
              Welcome back, {userProfile?.full_name || user.email} • {userProfile?.company}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">{userProfile?.full_name}</div>
              <div className="text-gray-600">{user.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'projects', 'personnel', 'timeEntry'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  currentView === view
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {view === 'timeEntry' ? 'Time Entry' : view}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Dashboard */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Briefcase className="text-blue-600" size={48} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Your Clean Project Tracker!</h2>
              <p className="text-gray-600 mb-6">
                Your professional project management system is ready to use. Start by adding your first project and team members.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => setShowProjectSetup(true)}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add First Project
                </button>
                <button
                  onClick={() => setShowAddPersonnel(true)}
                  className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  Add Team Member
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                    <p className="text-xs text-gray-500">{analytics.activeProjectsCount} active</p>
                  </div>
                  <Briefcase className="text-blue-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-green-600">{personnel.length}</p>
                    <p className="text-xs text-gray-500">Ready to work</p>
                  </div>
                  <Users className="text-green-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Entries</p>
                    <p className="text-2xl font-bold text-purple-600">{timeEntries.length}</p>
                    <p className="text-xs text-gray-500">Hours logged</p>
                  </div>
                  <Clock className="text-purple-600" size={24} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(analytics.portfolioValue)}</p>
                    <p className="text-xs text-gray-500">Portfolio value</p>
                  </div>
                  <DollarSign className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            {/* Getting Started Guide */}
            {projects.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Getting Started Guide</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span>✅ Authentication system is set up and working</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                    <span>Add your first project with budget and timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                    <span>Add team members with their roles and rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                    <span>Assign personnel to projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center text-xs font-bold">4</div>
                    <span>Start tracking time and monitor progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simple Project Setup Modal */}
        {showProjectSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Project</h2>
                  <button
                    onClick={() => setShowProjectSetup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project name *"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Client name"
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    placeholder="Project description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={newProject.budgetType}
                    onChange={(e) => setNewProject({...newProject, budgetType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hours">Hours Only</option>
                    <option value="cost">Cost Only</option>
                    <option value="both">Both Hours & Cost</option>
                  </select>

                  {(newProject.budgetType === 'hours' || newProject.budgetType === 'both') && (
                    <input
                      type="number"
                      placeholder="Budget hours"
                      value={newProject.budgetHours}
                      onChange={(e) => setNewProject({...newProject, budgetHours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {(newProject.budgetType === 'cost' || newProject.budgetType === 'both') && (
                    <input
                      type="number"
                      placeholder="Budget cost ($)"
                      value={newProject.budgetCost}
                      onChange={(e) => setNewProject({...newProject, budgetCost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setShowProjectSetup(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addProject}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Personnel Modal */}
        {showAddPersonnel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
                  <button
                    onClick={() => setShowAddPersonnel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name *"
                    value={newPersonnel.name}
                    onChange={(e) => setNewPersonnel({...newPersonnel, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Role/Title *"
                    value={newPersonnel.role}
                    onChange={(e) => setNewPersonnel({...newPersonnel, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Hourly rate *"
                    value={newPersonnel.rate}
                    onChange={(e) => setNewPersonnel({...newPersonnel, rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={newPersonnel.email}
                    onChange={(e) => setNewPersonnel({...newPersonnel, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Department"
                    value={newPersonnel.department}
                    onChange={(e) => setNewPersonnel({...newPersonnel, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setShowAddPersonnel(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPersonnel}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Person
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other views show simple messages */}
        {currentView !== 'overview' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 capitalize">
              {currentView} Management
            </h2>
            <p className="text-gray-600 mb-6">
              {currentView === 'projects' && 'Manage your projects here. Start by adding your first project!'}
              {currentView === 'personnel' && 'Manage your team members here. Start by adding your first team member!'}
              {currentView === 'timeEntry' && 'Track time here. Add projects and personnel first to start logging time!'}
            </p>
            
            {currentView === 'projects' && (
              <button
                onClick={() => setShowProjectSetup(true)}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Add First Project
              </button>
            )}
            
            {currentView === 'personnel' && (
              <button
                onClick={() => setShowAddPersonnel(true)}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 flex items-center gap-2 mx-auto"
              >
                <Users size={16} />
                Add Team Member
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

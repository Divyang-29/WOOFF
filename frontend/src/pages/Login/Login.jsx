export default function Login() {
  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '75vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div
              className="p-4 p-sm-5 rounded-4 shadow text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(122, 78, 45, 0.15)',
              }}
            >
              <h2 className="fs-3 fw-bold mb-2" style={{ color: '#4B2E1E' }}>
                Welcome Back
              </h2>
              <p className="small mb-4" style={{ color: '#8C7B6A' }}>
                Log in to access your Wooff account.
              </p>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3 text-start">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="form-control py-2 px-3"
                    style={{
                      borderRadius: '10px',
                      borderColor: 'rgba(122, 78, 45, 0.25)',
                    }}
                  />
                </div>
                <div className="mb-4 text-start">
                  <input
                    type="password"
                    placeholder="Password"
                    className="form-control py-2 px-3"
                    style={{
                      borderRadius: '10px',
                      borderColor: 'rgba(122, 78, 45, 0.25)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 py-2 fw-semibold"
                  style={{
                    backgroundColor: '#e58b57',
                    color: '#ffffff',
                    borderRadius: '50px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(229, 139, 87, 0.3)',
                  }}
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


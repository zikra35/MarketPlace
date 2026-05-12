const successResponse = (data, message = null) => {
  const response = {
    success: true,
  };

  if (data !== undefined && data !== null) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return response;
};

const errorResponse = (message, statusCode = 500) => {
  return {
    success: false,
    message: message,
  };
};

module.exports = {
  successResponse,
  errorResponse,
};

function status(req, res) {
  res.status(200).json({
    status: "OK",
    message: "São acima da média!",
  });
}

export default status;

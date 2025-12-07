module.exports = {
  apps: [
    {
      name: "damara-BE",
      script: "./dist/src/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      // 로그 설정
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // console.log와 logger 모두 캡처
      capture: true,
      // 로그 파일 크기 제한 (10MB)
      max_size: "10M",
      // 로그 파일 보관 개수
      retain: 5,
      // 자동 재시작 설정
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};

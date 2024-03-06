import { APIService } from "@services/api.service";
// helper
import { API_BASE_URL } from "@helpers/common.helper";

import { IAppConfig } from "@servcy/types";

export class AppConfigService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async envConfig(): Promise<IAppConfig> {
    return this.get("/api/configs/", {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

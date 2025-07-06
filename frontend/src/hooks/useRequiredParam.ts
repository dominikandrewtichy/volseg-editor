import { useParams } from "react-router";

export function useRequiredParam(paramName: string): string {
  const params = useParams();
  const param = params[paramName];
  if (!param) {
    throw new Error(`Missing required URL parameter: ${paramName}`);
  }
  return param;
}

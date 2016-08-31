declare module "jmespath" {
    export function search(json: any, pattern: string): any;
}
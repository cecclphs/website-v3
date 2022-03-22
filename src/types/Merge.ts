type Merge<A, B> = ({ [K in keyof A]: K extends keyof B ? B[K] : A[K] } &
    B) extends infer O
    ? { [K in keyof O]: O[K] }
    : never;
  
export default Merge;
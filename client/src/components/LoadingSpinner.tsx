import styles from "./LoadingSpinner.module.scss"

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  return <div className={`${styles['spinner']} ${styles[size]}`} />
}

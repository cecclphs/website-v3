import React from "react";
import { useTheme } from "@mui/material";
import { Transition } from "react-transition-group";

export const SlideTransition = React.forwardRef(({ children, ...props }, ref) => {
    const theme = useTheme();

    if (!children) return null;

    const defaultStyle = {
      opacity: 0,
      transform: "translateY(40px)",

      transition: theme.transitions.create(["transform", "opacity"], {
        duration: "300ms",
        easing: "cubic-bezier(0.1, 0.8, 0.1, 1)",
      }),
    };

    const transitionStyles = {
      entering: {
        willChange: "transform, opacity",
      },

      entered: {
        opacity: 1,
        transform: "none",
      },

      exiting: {
        opacity: 0,
        transform: "none",

        transition: theme.transitions.create(["opacity"], {
          duration: theme.transitions.duration.leavingScreen,
        }),
      },

      exited: {
        opacity: 0,
        transform: "none",
        transition: "none",
      },

      unmounted: {},
    };

    return (
      <Transition
        appear
        timeout={{ enter: 0, exit: theme.transitions.duration.leavingScreen }}
        {...props}
      >
        {(state) =>
          React.cloneElement(children, {
            style: { ...defaultStyle, ...transitionStyles[state] },
            ref,
          })
        }
      </Transition>
    );
  }
);

export default SlideTransition;

export const SlideTransitionMui = React.forwardRef(function Transition(
  props,ref
) {
  return <SlideTransition ref={ref} {...props} />;
});
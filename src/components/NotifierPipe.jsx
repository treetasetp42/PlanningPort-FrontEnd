import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { removeSnackbar } from '../features/uiSlice';

const NotifierPipe = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(state => state.ui.notifications || []);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        notifications.forEach(({ key, message, options = {}, dismissed = false }) => {
            if (dismissed) {
                // Dimiss snackbar from Redux
                closeSnackbar(key);
                return;
            }

            // Display snackbar
            enqueueSnackbar(message, {
                key,
                ...options,
                onExited: (event, myKey) => {
                    // Remove this snackbar from Redux store when it's closed
                    dispatch(removeSnackbar(myKey));
                },
            });
        });
    }, [notifications, enqueueSnackbar, closeSnackbar, dispatch]);

    return null;
};

export default NotifierPipe;

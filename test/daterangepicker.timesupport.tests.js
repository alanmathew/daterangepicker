define([
    'lib/daterangepicker/daterangepicker',
    'lib/daterangepicker/daterangepicker.timesupport'
], function(daterangepicker, timesupport) {
    'use strict';

    var DateRangePicker = daterangepicker.DateRangePicker;

    describe('time support plugin', function() {
        var picker,
            sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();

            if (picker) {
                picker.destroy();
                picker = undefined;
            }
        });

        describe('when attached', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();
            });

            it('renders a time support wrapper', function() {
                expect(picker.$el.find('.time-support').length).toEqual(1);
            });

            it('renders a checkbox to allow the use to specify a time', function() {
                expect(picker.$el.find('[name="specifyTime"]').length).toEqual(1);
            });

            it('renders two panels inside the wrapper', function() {
                expect(picker.$el.find('.time-support__panel-wrapper .time-support__panel').length).toEqual(2);
            });
        });

        describe('isValidTime', function() {
            var i,
                validTimes = ['00:00', '10:20', '02:30'],
                invalidTimes = ['0000', '   10:20', '12:  23', '2:30', '23 : 45', '10:20   ', '24:00', '23:59:59', '', '  ', '23:1d', '23::00', '2pm', '12am', '0'];

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });
            });

            function testTimeValidity(time, isValid) {
                var description = 'should be ' + ((isValid) ? 'valid' : 'invalid');

                describe(time, function() {
                    it(description, function() {
                        picker.timeSupport.startPanel.setTime(time);

                        expect(picker.timeSupport.startPanel.isValidTime()).toEqual(isValid);
                    });
                });
            }

            for (i = validTimes.length - 1; i >= 0; i--) {
                testTimeValidity(validTimes[i], true);
            }

            for (i = invalidTimes.length - 1; i >= 0; i--) {
                testTimeValidity(invalidTimes[i], false);
            }
        });

        describe('input validation indicator', function() {
            var $input;

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                $input = picker.$el.find('input[name="time"]').first();
            });

            describe('when the value is invalid', function() {
                it('adds the class "invalid-time" when the value is not a valid time', function() {
                    $input.val('9999').trigger('change');
                    expect($input.hasClass('invalid-time')).toEqual(true);
                });

                it('adds the class "invalid-time" when the value is empty', function() {
                    $input.val('').trigger('change');
                    expect($input.hasClass('invalid-time')).toEqual(true);
                });
            });

            describe('when the value is valid', function() {
                beforeEach(function() {
                    $input.val('20:10').trigger('change');
                });

                it('removes the class "invalid-time" on change', function() {
                    expect($input.hasClass('invalid-time')).toEqual(false);
                });

                it('updates the calendar selected date', function() {
                    expect(picker.startCalendar.selectedDate.hours()).toEqual(20);
                    expect(picker.startCalendar.selectedDate.minutes()).toEqual(10);
                });
            });
        });

        describe('highlighting cells', function() {
            var $startTime,
                $endTime;

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                $startTime = picker.$el.find('input[name="time"]').first();
                $endTime = picker.$el.find('input[name="time"]').last();
            });

            describe('when a start time is entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('12:00').trigger('change');
                    $endTime.val('').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when an end time is entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('').trigger('change');
                    $endTime.val('19:00').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when a start and end times are entered and the dates are the same', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('12:20').trigger('change');
                    $endTime.val('19:00').trigger('change');
                });

                it('correctly highlights the calendar cells', function() {
                    expect(picker.startCalendar.$el.find('.inRange').length).toEqual(0);
                });
            });

            describe('when a start time is later than the end time', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $endTime.val('10:00').trigger('change');
                    $startTime.val('14:20').trigger('change');
                });

                it('changes the end time to match the start time', function() {
                    expect($endTime.val()).toEqual('14:20');
                });
            });

            describe('when an end time is earlier than the start time', function() {
                beforeEach(function() {
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();

                    $startTime.val('14:20').trigger('change');
                    $endTime.val('10:00').trigger('change');
                });

                it('changes the start time to match the end time', function() {
                    expect($startTime.val()).toEqual('10:00');
                });
            });
        });

        describe('daterangepicker events', function() {
            var $startTime,
                $endTime;

            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport],
                    presets: {
                        'last hour': {
                            startDate: moment([2014, 9, 1, 10, 0]).format('YYYY-MM-DDTHH:mm'),
                            endDate: moment([2014, 9, 1, 11, 0]).format('YYYY-MM-DDTHH:mm'),
                            specifyTime: true
                        },
                        '7d': {
                            startDate: moment([2014, 9, 1, 10, 0]).format('YYYY-MM-DDTHH:mm'),
                            endDate: moment([2014, 9, 1, 17, 0]).format('YYYY-MM-DDTHH:mm')
                        }
                    },
                    startDate: '2014-10-01',
                    endDate: '2014-10-01'
                });

                picker.render();

                sinon.spy(picker, 'trigger');

                $startTime = picker.$el.find('input[name="time"]').first();
                $endTime = picker.$el.find('input[name="time"]').last();
            });

            describe('when startDateSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    $startTime.val('12:00').trigger('change');
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('12:00');
                    expect($endTime.val()).toEqual('12:00');
                    expect(picker.trigger.calledWith('startDateSelected')).toEqual(true);
                });

                it('updates the calendars selectedDate', function() {
                    expect(picker.startCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T12:00');
                    expect(picker.endCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T12:00');
                });
            });

            describe('when endDateSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    $endTime.val('12:00').trigger('change');
                    picker.endCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                    picker.startCalendar.$el.find('.day[data-date="2014-9-19"]').click();
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('00:00');
                    expect($endTime.val()).toEqual('12:00');
                    expect(picker.trigger.calledWith('endDateSelected')).toEqual(true);
                });

                it('updates the calendars selectedDate', function() {
                    expect(picker.startCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T00:00');
                    expect(picker.endCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T12:00');
                });
            });

            describe('when presetSelected is triggered on the daterangepicker', function() {
                beforeEach(function() {
                    picker.$el.find('.presets li').eq(0).click();
                });

                it('updates the time fields to show the new date', function() {
                    expect($startTime.val()).toEqual('10:00');
                    expect($endTime.val()).toEqual('11:00');
                    expect(picker.trigger.calledWith('presetSelected')).toEqual(true);
                });

                it('opens the time support panel if the event args.specifyTime is true', function() {
                    expect(picker.$el.find('input[name="specifyTime"]').prop('checked')).toEqual(true);
                    expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(true);
                });

                it('closes the time support panel if the event args.specifyTime is false', function() {
                    picker.$el.find('.presets li').eq(1).click();

                    expect(picker.$el.find('input[name="specifyTime"]').prop('checked')).toEqual(false);
                    expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(false);
                });

                it('updates the calendars selectedDate', function() {
                    expect(picker.startCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T10:00');
                    expect(picker.endCalendar.selectedDate.format('YYYY-MM-DDTHH:mm')).toEqual('2014-10-01T11:00');
                });
            });
        });

        describe('when detached', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                picker.timeSupport.detach(picker);
            });

            it('removes the time input fields', function() {
                expect(picker.$el.find('input[name="time"]').length).toEqual(0);
            });

            it('removes the time time panel', function() {
                expect(picker.$el.find('.time-panel-wrapper').length).toEqual(0);
            });
        });

        describe('updating the calendar date', function() {
            beforeEach(function() {
                picker = daterangepicker.create({
                    plugins: [timesupport]
                });

                picker.render();

                picker.timeSupport.detach(picker);

                sandbox.spy(picker.startCalendar, 'updateSelectedDate');
            });

            it('updates the calendar date to use utc', function() {
                sandbox.stub(picker.timeSupport.startPanel, 'getTime').returns(moment('10:00', 'HH:mm'));

                picker.timeSupport.startPanel.updateCalendarDate();

                expect(picker.startCalendar.updateSelectedDate.args[0][0]._isUTC).toEqual(true);
            });
        });

        describe('as a jquery plugin', function() {
            var input,
                picker,
                $startTime,
                $endTime,
                endDateSelectedSpy,
                startDateSelectedSpy;

            beforeEach(function() {
                input = $('<input id="pickerInput"/>');
                $('#testArea').append(input);

                input.daterangepicker({
                    startDate: '2014-09-01',
                    endDate: '2014-09-07',
                    plugins: [timesupport],
                    dateFormatter: function(startDate, endDate) {
                        var picker = input.data('picker'),
                            specifyTime = picker.$el.find('[name=specifyTime]').prop('checked');

                        if (specifyTime) {
                            return startDate.format('DD MMM YYYY, HH:mm') + ' - ' + endDate.format('DD MMM YYYY, HH:mm');
                        } else {
                            return startDate.format('DD MMM YYYY') + ' - ' + endDate.format('DD MMM YYYY');
                        }
                    }
                });

                picker = input.data('picker');

                $startTime = picker.$el.find('.time-support__field').eq(0);
                $endTime = picker.$el.find('.time-support__field').eq(1);

                startDateSelectedSpy = sandbox.spy();
                endDateSelectedSpy = sandbox.spy();

                picker.bind('startDateSelected', startDateSelectedSpy);
                picker.bind('endDateSelected', endDateSelectedSpy);

                input.trigger('click');
            });

            afterEach(function() {
                input.data('picker').destroy();
                $('#testArea').empty();
            });

            it('hides the panel wrapper by default', function() {
                expect(picker.$el.find('.time-support__panel-wrapper').is(':visible')).toEqual(false);
            });

            it('shows the specify time checkbox by default', function() {
                expect(picker.$el.find('.time-support__specify-time').is(':visible')).toEqual(true);
            });

            describe('when the specify time checkbox is checked', function() {
                beforeEach(function() {
                    picker.$el.find('[name=specifyTime]').prop('checked', false).trigger('click');
                });

                it('adds the class "isOpen" to the panel wrapper', function() {
                    expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(true);
                });

                it('shows the panel wrapper', function() {
                    expect(picker.$el.find('.time-support__panel-wrapper').is(':visible')).toEqual(true);
                });

                it('sets the time to "00:00"', function() {
                    expect($startTime.val()).toEqual('00:00');
                    expect($endTime.val()).toEqual('00:00');
                });

                it('does not trigger "onStartDateSelected" or "onEndDateSelected" when setting the default time', function() {
                    expect(startDateSelectedSpy.called).toEqual(false);
                    expect(endDateSelectedSpy.called).toEqual(false);
                });

                describe('when a day is clicked', function() {
                    beforeEach(function() {
                        picker.startCalendar.$el.find('.day[data-date="2014-09-02"]').click();
                    });

                    it('updates the input field to show date and current time formatted using the dateFormatter', function() {
                        expect(input.val()).toEqual('02 Sep 2014, 00:00 - 07 Sep 2014, 00:00');
                    });
                });

                describe('when a time is entered before a day is clicked', function() {
                    beforeEach(function() {
                        $startTime.val('10:30').trigger('change');
                        $endTime.val('04:30').trigger('change');

                        picker.startCalendar.$el.find('.day[data-date="2014-09-02"]').click();
                        picker.endCalendar.$el.find('.day[data-date="2014-09-05"]').click();
                    });

                    it('updates the input field to show date and current time formatted using the dateFormatter', function() {
                        expect(input.val()).toEqual('02 Sep 2014, 10:30 - 05 Sep 2014, 04:30');
                    });
                });

                describe('when the end date selected is earlier than the start date and time', function() {
                    beforeEach(function() {
                        $startTime.val('10:30').trigger('change');
                        $endTime.val('04:30').trigger('change');

                        picker.startCalendar.$el.find('.day[data-date="2014-09-02"]').click();
                        picker.endCalendar.$el.find('.day[data-date="2014-09-02"]').click();
                    });

                    it('sets the start time to be the same as the end time', function() {
                        expect($startTime.val()).toEqual('04:30');
                        expect($endTime.val()).toEqual('04:30');
                    });
                });

                describe('when the start date selected is later than the end date and time', function() {
                    beforeEach(function() {
                        $startTime.val('10:30').trigger('change');
                        $endTime.val('04:30').trigger('change');

                        picker.endCalendar.$el.find('.day[data-date="2014-09-02"]').click();
                        picker.startCalendar.$el.find('.day[data-date="2014-09-03"]').click();
                    });

                    it('sets the end time to be the same as the start time', function() {
                        expect($startTime.val()).toEqual('10:30');
                        expect($endTime.val()).toEqual('10:30');
                    });
                });

                describe('after a time has been selected', function() {
                    beforeEach(function() {
                        $startTime.val('10:30').trigger('change');
                        $endTime.val('04:30').trigger('change');
                    });

                    describe('when specify time is unchecked', function() {
                        beforeEach(function() {
                            picker.$el.find('[name=specifyTime]').prop('checked', true).trigger('click');
                        });

                        it('updates the input field to show the date only', function() {
                            expect(input.val()).toEqual('01 Sep 2014 - 07 Sep 2014');
                        });

                        describe('when specify time is checked again', function() {
                            beforeEach(function() {
                                picker.$el.find('[name=specifyTime]').prop('checked', false).trigger('click');
                            });

                            it('resets the time fields to "00:00"', function() {
                                expect($startTime.val()).toEqual('00:00');
                                expect($endTime.val()).toEqual('00:00');
                            });

                            it('resets the input to show the date and default', function() {
                                expect(input.val()).toEqual('01 Sep 2014, 00:00 - 07 Sep 2014, 00:00');
                            });
                        });
                    });
                });
            });

            describe('when the specify time checkbox is unchecked', function() {
                beforeEach(function() {
                    picker.$el.find('[name=specifyTime]').prop('checked', true).trigger('click');
                });

                it('removes the class "isOpen" from the panel wrapper', function() {
                    expect(picker.$el.find('.time-support__panel-wrapper').hasClass('isOpen')).toEqual(false);
                });

                it('hides the panel wrapper', function() {
                    expect(picker.$el.find('.time-support__panel-wrapper').is(':visible')).toEqual(false);
                });
            });
        });
    });
});
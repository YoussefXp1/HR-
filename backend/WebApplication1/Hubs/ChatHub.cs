using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using WebApplication1.Hubs;

namespace WebApplication1.Hubs
{
    [Authorize] // Require authentication for all methods
    public class ChatHub : Hub
    {
        // Called by client to join a group based on role and user ID
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        // Called by client to leave a group (optional)
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        // Send message to the specified group (target group)
        public async Task SendMessage(string receiverId, string senderRole, string senderName, string message)
        {
            var timestamp = DateTime.UtcNow.ToString("o");

            // Create message object
            var messagePayload = new
            {
                SenderRole = senderRole,
                SenderName = senderName,
                Content = message,
                Timestamp = timestamp
            };

            if (senderRole == "HR")
            {
                // HR sends to specific employee group
                var targetGroup = $"Employee-{receiverId}";
                await Clients.Group(targetGroup).SendAsync("ReceiveMessage", messagePayload);
            }
            else if (senderRole == "Employee")
            {
                // Employee sends to HR group
                var targetGroup = "HR";
                await Clients.Group(targetGroup).SendAsync("ReceiveMessage", messagePayload);
            }
        }


        // Optional: override OnConnectedAsync to assign groups automatically based on user claims
        public override async Task OnConnectedAsync()
        {
            var user = Context.User;
            if (user == null)
            {
                await base.OnConnectedAsync();
                return;
            }

            // Example: get user role and ID from claims
            var role = user.FindFirst("role")?.Value;
            var userId = user.FindFirst("Id")?.Value; // or "id", depends on your JWT claims

            if (!string.IsNullOrEmpty(role) && !string.IsNullOrEmpty(userId))
            {
                if (role == "HR")
                {
                    // HR group - can be general or company-specific
                    await Groups.AddToGroupAsync(Context.ConnectionId, "HR");
                }
                else if (role == "Employee")
                {
                    // Employee group by their own user id
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Employee-{userId}");
                }
            }

            await base.OnConnectedAsync();
        }

        // Optional: override OnDisconnectedAsync for cleanup if needed
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Cleanup code if you track connections or groups manually
            await base.OnDisconnectedAsync(exception);
        }
    }
}
